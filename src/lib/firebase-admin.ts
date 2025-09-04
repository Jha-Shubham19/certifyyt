import admin from "firebase-admin";

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
  const privateKey = rawPrivateKey.replace(/^"|"$/g, "").replace(/\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

// Export the initialized admin instance and services
export const adminApp = admin;
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
