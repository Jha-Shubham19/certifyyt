import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// Return certificates for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const snap = await adminDb.collection("certificates").where("userId", "==", decoded.uid).get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (err) {
    console.error("Certificate list failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Only allow updating userName of an already server-issued certificate for the owner
export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }

    const idToken = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(idToken);

    const body = await req.json();
    const { id, userName } = body || {};
    if (!id || typeof userName !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const docRef = adminDb.collection("certificates").doc(id);
    const snap = await docRef.get();
    if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const data = snap.data() as any;

    if (data.userId !== decoded.uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!data.serverIssued) return NextResponse.json({ error: "Not server-issued" }, { status: 403 });

    await docRef.set({ userName: userName.trim() }, { merge: true });
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("Certificate write failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}


