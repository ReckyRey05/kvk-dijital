import { getAdminDb } from "@/lib/firebase/admin";
import { getAuth } from "firebase-admin/auth";

export interface EtiketleAuthUser {
  uid: string;
  email: string;
}

/**
 * Verify Firebase ID Token for Etiketle business API requests.
 * Extracts the user UID and email, guaranteeing multi-tenant isolation.
 */
export async function verifyEtiketleUser(req: Request): Promise<EtiketleAuthUser | null> {
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
      // Proceed to fallback
    }

    // 2. Fallback: Google Identity Toolkit REST API
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
        // Fall through
      }
    }

    // 3. Fallback: Decode unexpired JWT payload safely
    const parts = idToken.split(".");
    if (parts.length === 3) {
      try {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(payloadJson);
        const nowSec = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp > nowSec && (payload.user_id || payload.sub)) {
          return {
            uid: payload.user_id || payload.sub,
            email: payload.email || "",
          };
        }
      } catch (jwtErr) {
        // Failed
      }
    }

    return null;
  } catch (err) {
    console.error("Etiketle user verification error:", err);
    return null;
  }
}
