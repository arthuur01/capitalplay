import { initializeApp, getApps, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const apps = getApps();

// Prefer credentials from env: FIREBASE_ADMIN_PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

// Handle escaped newlines in private key
if (privateKey) {
  privateKey = privateKey.replace(/\\n/g, "\n");
}

const app =
  apps.length === 0
    ? initializeApp(
        clientEmail && privateKey
          ? {
              credential: cert({
                projectId: projectId as string,
                clientEmail,
                privateKey: privateKey as string
              })
            }
          : {
              credential: applicationDefault()
            }
      )
    : apps[0];

export const adminDb = getFirestore(app);