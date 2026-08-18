import { getAdminDb } from "@/lib/firebase/admin";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";

/**
 * Validates the Authorization Bearer Firebase ID Token for server Route Handlers.
 * Ensures the token is valid, email is verified, and belongs to an authorized corporate admin.
 * Returns the decoded ID token if valid, or null if unauthorized.
 */
export async function verifyAdminServerRequest(req: Request): Promise<DecodedIdToken | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.substring(7).trim();
    if (!idToken) return null;

    // Ensure Firebase Admin SDK is initialized before verifying token
    getAdminDb();

    // Verify ID token via Firebase Admin Auth (checkRevoked = true)
    const decodedToken = await getAuth().verifyIdToken(idToken, true);
    
    // Validate corporate admin credentials
    const isEmailVerified = decodedToken.email_verified === true;
    const isCorporateAdmin = 
      decodedToken.email === "alihaydarkvk@kvkdijitalcozumler.com" ||
      decodedToken.email === "iletisim@kvkdijitalcozumler.com" ||
      (decodedToken.email?.endsWith("@kvkdijitalcozumler.com") ?? false);

    if (isEmailVerified && isCorporateAdmin) {
      return decodedToken;
    }

    return null;
  } catch {
    // Return null silently without logging sensitive token data
    return null;
  }
}
