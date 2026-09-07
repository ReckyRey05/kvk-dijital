import { NextRequest, NextResponse } from "next/server";
import { getPublicListings } from "@/lib/itemsepeti/catalogService";
import { SEED_GAMES } from "@/lib/itemsepeti/catalogSeedData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    if (!q) {
      return NextResponse.json({ success: true, games: [], listings: [] });
    }

    // Fast matching games
    const matchedGames = SEED_GAMES.filter(
      (g) => g.name.toLowerCase().includes(q) || g.slug.includes(q)
    ).slice(0, 3);

    // Fast matching listings
    const listings = await getPublicListings({ searchQuery: q, limit: 6 });

    return NextResponse.json({
      success: true,
      games: matchedGames,
      listings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
