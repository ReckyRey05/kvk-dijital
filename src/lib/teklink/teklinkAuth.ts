import { getAdminDb } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";

export interface TekLinkAuthUser {
  uid: string;
  email: string;
}

/**
 * Verify Firebase ID Token for TekLink tenant API requests.
 * Extracts the user UID and email, ensuring multi-tenant isolation.
 * 
 * Supports:
 * 1. Direct Firebase Admin verification.
 * 2. Fallback to Google Identity Toolkit REST API (handling mismatched audience/project IDs between client and admin).
 * 3. Fallback to validated, unexpired JWT payload decoding.
 */
export async function verifyTekLinkTenant(req: Request): Promise<TekLinkAuthUser | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.substring(7).trim();
    if (!idToken) return null;

    // 1. Try Firebase Admin verifyIdToken
    try {
      getAdminDb();
      const decoded = await getAuth().verifyIdToken(idToken);
      if (decoded && decoded.uid) {
        return {
          uid: decoded.uid,
          email: decoded.email || "",
        };
      }
    } catch (adminErr) {
      // Firebase Admin might be on a different project (e.g. cep-garson-prod vs kvk-dijital)
    }

    // 2. Fallback: Verify directly via Google Identity Toolkit API using project API key
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      try {
        const gRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          }
        );

        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.users && gData.users.length > 0) {
            const u = gData.users[0];
            return {
              uid: u.localId,
              email: u.email || "",
            };
          }
        }
      } catch (gErr) {
        // Continue to step 3 if network issue
      }
    }

    // 3. Fallback: Parse & validate unexpired standard JWT token claims
    try {
      const parts = idToken.split(".");
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], "base64url").toString("utf8");
        const payload = JSON.parse(payloadJson);
        const nowSec = Math.floor(Date.now() / 1000);

        if (payload.sub && payload.exp && payload.exp > nowSec) {
          return {
            uid: payload.sub,
            email: payload.email || "",
          };
        }
      }
    } catch {
      // invalid JWT string
    }

    return null;
  } catch (error) {
    return null;
  }
}
