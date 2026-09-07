import { NextRequest, NextResponse } from "next/server";
import { getListingById } from "@/lib/itemsepeti/catalogService";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "İlan ID gereklidir." }, { status: 400 });
    }

    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json({ success: false, error: "İlan bulunamadı veya aktif değil." }, { status: 404 });
    }

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Hata oluştu." }, { status: 500 });
  }
}
