"use client";

import type { Certificate } from "./types";
import { getAuth } from "firebase/auth";

export async function saveCertificate(certificate: Certificate): Promise<Certificate> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const idToken = await currentUser.getIdToken();

  // In secure flow, certificate is created server-side during validation.
  // This call is now used to update fields like userName if needed.
  const res = await fetch("/api/certificates", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ id: certificate.id, userName: certificate.userName }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to save certificate");
  }

  return certificate;
}

export async function fetchMyCertificates(): Promise<Certificate[]> {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("Not authenticated");
  }

  const idToken = await currentUser.getIdToken();
  const res = await fetch("/api/certificates", {
    headers: { Authorization: `Bearer ${idToken}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to fetch certificates");
  }
  const json = await res.json();
  return (json?.items || []) as Certificate[];
}


