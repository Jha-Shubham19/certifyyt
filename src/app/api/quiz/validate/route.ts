import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

function toSafeKey(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

// Regex to extract YouTube video ID or playlist ID
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=([a-zA-Z0-9_-]{11})|playlist\?list=([a-zA-Z0-9_-]+))/;
const youtubeShortRegex = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;

function extractVideoAndPlaylistIds(url: string): { videoId?: string; playlistId?: string } {
  let match = url.match(youtubeRegex);
  let shortMatch = url.match(youtubeShortRegex);

  let videoId: string | undefined = undefined;
  let playlistId: string | undefined = undefined;

  if (match) {
    videoId = match[1];
    playlistId = match[2];
  } else if (shortMatch) {
    videoId = shortMatch[1];
  }

  return { videoId, playlistId };
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const { youtubeUrl, userAnswers, displayName } = await req.json();
    if (!youtubeUrl || typeof userAnswers !== "object" || typeof displayName !== "string" || !displayName.trim()) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Extract videoId and playlistId from the YouTube URL
    const { videoId, playlistId } = extractVideoAndPlaylistIds(youtubeUrl);
    if (!videoId && !playlistId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // Fetch MCQs with answers from cache for validation using stable key by ID
    const stableCacheKey = playlistId ? `yt:playlist:${playlistId}` : (videoId ? `yt:video:${videoId}` : `yt:url:${youtubeUrl}`);
    const id = toSafeKey(stableCacheKey);
    const snap = await adminDb.collection("quizCache").doc(id).get();
    
    if (!snap.exists) {
      return NextResponse.json({ error: "Quiz not found in cache" }, { status: 404 });
    }
    
    const data = snap.data() as any;
    const mcqs = data?.mcqs;
    const videoTitle = data?.title; // Extract video title from server-side cache
    
    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return NextResponse.json({ error: "Invalid quiz data" }, { status: 400 });
    }
    
    if (!videoTitle || typeof videoTitle !== "string") {
      return NextResponse.json({ error: "Video title not found in cache" }, { status: 400 });
    }

    // Validate answers
    const PASS_THRESHOLD = 70;
    const total = mcqs.length;
    let correct = 0;
    
    for (let i = 0; i < total; i++) {
      const correctAnswer = mcqs[i]?.answer;
      const userAnswer = userAnswers[i];
      if (typeof correctAnswer === "string" && userAnswer === correctAnswer) {
        correct++;
      }
    }
    
    const score = Math.round((correct / Math.max(total, 1)) * 100);
    const passed = score >= PASS_THRESHOLD;

    let certificateId: string | null = null;
    if (passed) {
      // Check if user already has a certificate for this video/playlist using videoId/playlistId
      let existingCertQuery;
      if (playlistId) {
        // Check for existing playlist certificate
        existingCertQuery = await adminDb.collection("certificates")
          .where("userId", "==", decoded.uid)
          .where("playlistId", "==", playlistId)
          .limit(1)
          .get();
      } else if (videoId) {
        // Check for existing video certificate
        existingCertQuery = await adminDb.collection("certificates")
          .where("userId", "==", decoded.uid)
          .where("videoId", "==", videoId)
          .limit(1)
          .get();
      }
      
      if (existingCertQuery && !existingCertQuery.empty) {
        // User already has a certificate for this video/playlist
        const existingCert = existingCertQuery.docs[0].data();
        return NextResponse.json({ 
          passed: true, 
          score, 
          certificateId: existingCert.id,
          videoTitle,
          message: "You already have a certificate for this video/playlist" 
        });
      }
      
      const certId = crypto.randomUUID();
      certificateId = certId;
      const certificate: any = {
        id: certId,
        userId: decoded.uid,
        userName: displayName.trim(),
        videoTitle,
        issueDate: new Date().toISOString(),
        score,
        serverIssued: true,
      };
      if (videoId) certificate.videoId = videoId;
      if (playlistId) certificate.playlistId = playlistId;
      await adminDb.collection("certificates").doc(certId).set(certificate, { merge: true });
    }

    return NextResponse.json({ passed, score, certificateId, videoTitle });
  } catch (err) {
    console.error("Quiz validation failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
