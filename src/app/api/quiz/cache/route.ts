import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import crypto from "crypto";

function toSafeKey(input: string): string {
  // Use sha256 hex to avoid any illegal Firestore path characters
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
    const id = toSafeKey(key);
    const snap = await adminDb.collection("quizCache").doc(id).get();
    if (!snap.exists) return NextResponse.json({ found: false });
    const data = snap.data() as any;
    // Strip answers before sending to client
    const sanitized = {
      ...data,
      mcqs: Array.isArray(data?.mcqs)
        ? data.mcqs.map((q: any) => ({
            question: q.question,
            options: q.options,
            // omit q.answer
          }))
        : [],
    };
    return NextResponse.json({ found: true, data: sanitized });
  } catch (e) {
    console.error("GET quiz cache error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, payload } = body || {};
    if (!key || !payload) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    const id = toSafeKey(key);
    // Ensure we store videoId/playlistId fields when provided for audit/lookup consistency
    await adminDb.collection("quizCache").doc(id).set({ ...payload, key }, { merge: false });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("POST quiz cache error", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


