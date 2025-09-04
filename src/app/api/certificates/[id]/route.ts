import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const snap = await adminDb.collection("certificates").doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = snap.data() as any;
    // Public validation endpoint returns minimal data only
    const result = {
      id: snap.id,
      userName: data.userName,
      videoTitle: data.videoTitle,
      score: data.score,
      issueDate: data.issueDate,
    };
    return NextResponse.json(result);
  } catch (err) {
    console.error("Certificate fetch failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


