import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _app: App | null = null;
let _db: Firestore | null = null;

/**
 * Firebase Admin SDK'yı lazy olarak başlatır.
 * Build zamanında değil, sadece gerçek istek geldiğinde çalışır.
 */
export function getAdminDb(): Firestore {
  if (_db) return _db;

  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK cannot be used on the client-side.');
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin SDK credentials missing. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables.'
    );
  }

  if (getApps().length === 0) {
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  _db = getFirestore();
  return _db;
}
