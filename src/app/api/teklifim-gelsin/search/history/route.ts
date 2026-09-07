import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserSearchHistory,
  recordSearchHistory,
  clearUserSearchHistory,
} from "@/lib/teklifimGelsin/searchService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 10;

    const history = await getUserSearchHistory(user.uid, limit);
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (err: any) {
    console.error("GET /api/teklifim-gelsin/search/history error:", err);
    return NextResponse.json(
      { error: "Arama geçmişi getirilemedi." },
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
    const { query, filters, resultsCount } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Arama terimi belirtilmelidir." },
        { status: 400 }
      );
    }

    const item = await recordSearchHistory(user.uid, query, filters, resultsCount || 0);

    return NextResponse.json({
      success: true,
      historyItem: item,
    });
  } catch (err: any) {
    console.error("POST /api/teklifim-gelsin/search/history error:", err);
    return NextResponse.json(
      { error: "Arama geçmişi kaydedilemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    await clearUserSearchHistory(user.uid);

    return NextResponse.json({
      success: true,
      message: "Arama geçmişi başarıyla temizlendi.",
    });
  } catch (err: any) {
    console.error("DELETE /api/teklifim-gelsin/search/history error:", err);
    return NextResponse.json(
      { error: "Arama geçmişi temizlenemedi." },
      { status: 500 }
    );
  }
}
