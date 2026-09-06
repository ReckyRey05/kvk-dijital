import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserFavoriteSuppliers,
  toggleFavoriteSupplier,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const favorites = await getUserFavoriteSuppliers(user.uid);
    return NextResponse.json({ favorites });
  } catch (err: any) {
    console.error("Teklifim GET favorites error:", err);
    return NextResponse.json({ error: "Favoriler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { supplier } = body;
    if (!supplier || !supplier.uid) {
      return NextResponse.json({ error: "Geçersiz tedarikçi bilgisi." }, { status: 400 });
    }

    const result = await toggleFavoriteSupplier(user.uid, supplier);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Teklifim POST favorite error:", err);
    return NextResponse.json({ error: "Favori işlemi başarısız." }, { status: 500 });
  }
}
