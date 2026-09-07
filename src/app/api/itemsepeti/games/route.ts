import { NextRequest, NextResponse } from "next/server";
import { getGames, getCategoriesByGame } from "@/lib/itemsepeti/catalogService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (gameId) {
      const categories = await getCategoriesByGame(gameId);
      return NextResponse.json({ success: true, categories });
    }

    const games = await getGames();
    return NextResponse.json({ success: true, games });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Katalog verisi alınamadı." },
      { status: 500 }
    );
  }
}
