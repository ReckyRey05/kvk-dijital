import { getAdminDb } from "@/lib/firebase/admin";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";

export interface TekLinkAuthUser {
  uid: string;
  email: string;
}

/**
 * Verify Firebase ID Token for TekLink tenant API requests.
 * Extracts the user UID and email, ensuring multi-tenant isolation.
 */
export async function verifyTekLinkTenant(req: Request): Promise<TekLinkAuthUser | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.substring(7).trim();
    if (!idToken) return null;

    // Ensure Firebase Admin is initialized
    getAdminDb();

    // Verify token with Firebase Admin
    const decoded: DecodedIdToken = await getAuth().verifyIdToken(idToken);
    if (!decoded.uid) return null;

    return {
      uid: decoded.uid,
      email: decoded.email || "",
    };
  } catch (error) {
    // Return null on expired or invalid token
    return null;
  }
}
