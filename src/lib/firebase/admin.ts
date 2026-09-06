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

    if (serviceAccountKey) {
      try {
        let rawKey = serviceAccountKey.trim();
        if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
          rawKey = rawKey.slice(1, -1);
        }
        const serviceAccount = JSON.parse(rawKey);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        initializeApp({
          credential: cert(serviceAccount as any),
        });
      } catch (e) {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY parsing failed, falling back to default projectId initialization:', e);
        initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kvk-dijital',
        });
      }
    } else {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kvk-dijital',
      });
    }
  }

  _db = getFirestore();
  _db.settings({ ignoreUndefinedProperties: true });
  return _db;
}
