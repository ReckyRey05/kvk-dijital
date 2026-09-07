import { NextRequest, NextResponse } from "next/server";
import { getPublicListings } from "@/lib/itemsepeti/catalogService";
import { SEED_GAMES, SEED_CATEGORIES } from "@/lib/itemsepeti/catalogSeedData";
import { normalizeTitle } from "@/lib/itemsepeti/catalogUtils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQ = (searchParams.get("q") || "").trim();
    const q = normalizeTitle(rawQ);

    if (!q) {
      return NextResponse.json({ success: true, games: [], categories: [], listings: [] });
    }

    // Fast matching games
    const matchedGames = SEED_GAMES.filter((g) => {
      const normName = normalizeTitle(g.name);
      return normName.includes(q) || g.slug.includes(q);
    }).slice(0, 4);

    // Fast matching categories
    const matchedCategories = SEED_CATEGORIES.filter((c) => {
      const normCat = normalizeTitle(c.name);
      return normCat.includes(q) || c.slug.includes(q);
    }).slice(0, 4);

    // Fast matching listings
    const listings = await getPublicListings({ searchQuery: rawQ, limit: 12 });

    return NextResponse.json({
      success: true,
      query: rawQ,
      games: matchedGames,
      categories: matchedCategories,
      listings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
