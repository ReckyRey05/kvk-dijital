import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserSavedSearches,
  saveUserSearch,
} from "@/lib/teklifimGelsin/searchService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const searches = await getUserSavedSearches(user.uid);
    return NextResponse.json({
      success: true,
      searches,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/search/saved error:", err);
    return NextResponse.json(
      { error: "Kayıtlı aramalar getirilemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, query, filters, notifyOnNew, userRole } = body;

    if (!query && !filters) {
      return NextResponse.json(
        { error: "Kaydedilecek arama terimi veya filtresi belirtilmelidir." },
        { status: 400 }
      );
    }

    const saved = await saveUserSearch(user.uid, {
      title: title || query || "Kayıtlı Arama",
      query: query || "",
      filters: filters || {},
      notifyOnNew: Boolean(notifyOnNew),
      userRole,
    });

    return NextResponse.json({
      success: true,
      savedSearch: saved,
    });
  } catch (err: any) {
    console.error("POST /api/teklifim-gelsin/search/saved error:", err);
    return NextResponse.json(
      { error: "Arama kaydedilemedi." },
      { status: 500 }
    );
  }
}
