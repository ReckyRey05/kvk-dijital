import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let _db: Firestore | null = null;

/**
 * Firebase Admin SDK'yı lazy olarak başlatır.
 * Build zamanında değil, sadece gerçek istek geldiğinde çalışır.
 * FIREBASE_SERVICE_ACCOUNT_KEY ortam değişkeninden JSON olarak okur.
 */
export function getAdminDb(): Firestore {
  if (_db) return _db;

  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK cannot be used on the client-side.');
  }

  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
        'Add the full service account JSON as a single-line string in your Vercel environment variables.'
      );
    }

    let serviceAccount: Record<string, string>;
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON. Make sure it is properly escaped.');
    }

    initializeApp({
      credential: cert(serviceAccount as any),
    });
  }

  _db = getFirestore();
  return _db;
}
