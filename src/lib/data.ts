'use server';

import type { Certificate, MCQ } from "./types";
// Note: AI generation moved to server-side API endpoint
import { google } from "googleapis";
// Note: All certificate reads/writes are handled via server APIs; no direct client Firestore here.

// In-memory cache for generated MCQs to avoid repeated API calls for the same title.
const mcqCache = new Map<string, MCQ[]>();

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// Regex to extract YouTube video ID or playlist ID
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=([a-zA-Z0-9_-]{11})|playlist\?list=([a-zA-Z0-9_-]+))/;
const youtubeShortRegex = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;

async function getYouTubeTitles(url: string): Promise<{ titles: string[]; displayTitle: string } | null> {
  let match = url.match(youtubeRegex);
  let shortMatch = url.match(youtubeShortRegex);

  let videoId: string | undefined | null = null;
  let playlistId: string | undefined | null = null;

  if (match) {
    videoId = match[1];
    playlistId = match[2];
  } else if (shortMatch) {
    videoId = shortMatch[1];
  }

  if (playlistId) {
    try {
      // First, get the playlist details to get the playlist name
      const playlistResponse = await youtube.playlists.list({
        part: ["snippet"],
        id: [playlistId],
      });

      const playlistName = playlistResponse.data.items?.[0]?.snippet?.title;

      // Then get the video titles for MCQ generation
      const playlistItemsResponse = await youtube.playlistItems.list({
        part: ["contentDetails"],
        playlistId: playlistId,
        maxResults: 50, // YouTube API max limit
      });

      const videoIds =
        playlistItemsResponse.data.items
          ?.map((item) => item.contentDetails?.videoId)
          .filter((id): id is string => !!id) ?? [];
      
      if (videoIds.length === 0) return null;

      const videosResponse = await youtube.videos.list({
        part: ["snippet"],
        id: videoIds,
      });

      const videoTitles = videosResponse.data.items
        ?.map((item) => item.snippet?.title)
        .filter((title): title is string => !!title) ?? [];

      return {
        titles: videoTitles,
        displayTitle: playlistName || `Playlist ${playlistId}`
      };
    } catch (error) {
      console.error("Error fetching playlist videos:", error);
      return null;
    }
  } else if (videoId) {
    try {
      const videoResponse = await youtube.videos.list({
        part: ["snippet"],
        id: [videoId],
      });
      const title = videoResponse.data.items?.[0]?.snippet?.title;
      return title ? { titles: [title], displayTitle: title } : null;
    } catch (error) {
      console.error("Error fetching video title:", error);
      return null;
    }
  }

  return null;
}


/**
 * Fetches or generates MCQs for a given YouTube URL.
 * 1. Extracts video/playlist ID from the URL.
 * 2. Fetches titles using the YouTube Data API.
 * 3. Checks a cache for existing MCQs for that content.
 * 4. If not in cache, calls the GenAI flow to generate them.
 * 5. Caches and returns the MCQs.
 */
export async function getQuizData(youtubeUrl: string): Promise<{ title: string; mcqs: MCQ[] } | null> {
  const result = await getYouTubeTitles(youtubeUrl);
  
  if (!result || result.titles.length === 0) {
    console.error("Could not fetch titles for URL:", youtubeUrl);
    return null;
  }

  const { titles, displayTitle } = result;
  const combinedTitle = titles.join(', '); // Use all video titles for MCQ generation
  const certificateTitle = displayTitle; // Use playlist name or single video title for certificate

  // Derive stable cache key from videoId or playlistId so different URL variants hit same cache
  function extractIds(url: string): { videoId?: string; playlistId?: string } {
    const match = url.match(youtubeRegex);
    const shortMatch = url.match(youtubeShortRegex);
    let videoId: string | undefined = undefined;
    let playlistId: string | undefined = undefined;
    if (match) {
      videoId = match[1] || undefined;
      playlistId = match[2] || undefined;
    } else if (shortMatch) {
      videoId = shortMatch[1] || undefined;
    }
    return { videoId, playlistId };
  }

  const { videoId, playlistId } = extractIds(youtubeUrl);
  const stableCacheKey = playlistId ? `yt:playlist:${playlistId}` : (videoId ? `yt:video:${videoId}` : `yt:url:${youtubeUrl}`);

  // First try Firestore cache via backend endpoint (answers will be stripped for client)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
    const res = await fetch(`${baseUrl}/api/quiz/cache?key=${encodeURIComponent(stableCacheKey)}`, { cache: 'no-store' });
    if (res.ok) {
      const payload = await res.json();
      if (payload?.found && Array.isArray(payload.data?.mcqs) && payload.data.mcqs.length > 0) {
        return { title: certificateTitle, mcqs: payload.data.mcqs } as any;
      }
    }
  } catch (e) {
    console.warn('Quiz cache lookup failed, falling back to generation', e);
  }

  if (mcqCache.has(stableCacheKey)) {
    console.log("Serving from cache for:", stableCacheKey);
    return { title: certificateTitle, mcqs: mcqCache.get(stableCacheKey)! };
  }
  
  try {
    console.log("Generating new MCQs for:", combinedTitle);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
    const res = await fetch(`${baseUrl}/api/ai/generate-mcqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoTitle: combinedTitle }),
    });
    if (!res.ok) throw new Error('MCQ generation failed');
    const { mcqs: generatedMcqs } = await res.json();
    
    // The prompt now asks for 20 questions.
    const quizMcqs = generatedMcqs.slice(0, 20);
    // console.log("Generated MCQs for:", combinedTitle, quizMcqs);
    mcqCache.set(stableCacheKey, quizMcqs);

    // Persist to Firestore cache via backend (includes answers so backend can validate later)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
      await fetch(`${baseUrl}/api/quiz/cache`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: stableCacheKey,
          payload: { title: certificateTitle, mcqs: generatedMcqs, videoId: videoId || null, playlistId: playlistId || null },
        }),
      });
    } catch (e) {
      console.warn('Failed to write quiz cache', e);
    }
    
    return { title: certificateTitle, mcqs: quizMcqs };
  } catch (error) {
    console.error("Failed to generate MCQs:", error);
    return null;
  }
}

export async function getCertificateById(id: string): Promise<Certificate | undefined> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:9002');
    const res = await fetch(`${baseUrl}/api/certificates/${id}`, { cache: 'no-store' });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data as Certificate;
  } catch (error) {
    console.error("Error fetching certificate by ID:", error);
    return undefined;
  }
}

// Keep server utilities here; client save moved to src/lib/certificates-client.ts
// Server-side certificate saves are handled via /api endpoints. Client uses src/lib/certificates-client.ts
