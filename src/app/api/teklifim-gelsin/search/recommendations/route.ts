import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getPersonalizedRecommendationsForUser } from "@/lib/teklifimGelsin/searchService";

export async function GET(req: Request) {
  try {
    let userId: string | undefined;
    try {
      const user = await verifyTeklifimUser(req);
      if (user) {
        userId = user.uid;
      }
    } catch {
      // Unauthenticated visitors are allowed; general recommendations will be returned
    }

    const recommendations = await getPersonalizedRecommendationsForUser(userId);

    return NextResponse.json({
      success: true,
      recommendations,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/search/recommendations error:", err);
    return NextResponse.json(
      { error: "Öneriler getirilemedi." },
      { status: 500 }
    );
  }
}
