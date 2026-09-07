import { NextResponse } from "next/server";
import { getAutocompleteSuggestions } from "@/lib/teklifimGelsin/searchService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const suggestions = await getAutocompleteSuggestions(query);

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/search/autocomplete error:", err);
    return NextResponse.json(
      { error: "Tamamlama önerileri getirilemedi." },
      { status: 500 }
    );
  }
}
