import { NextResponse } from "next/server";
import { searchSuppliers } from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const city = searchParams.get("city") || undefined;
    const district = searchParams.get("district") || undefined;
    const deliveryRegion = searchParams.get("deliveryRegion") || undefined;
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || undefined;

    const suppliers = await searchSuppliers({
      category,
      city,
      district,
      deliveryRegion,
      verifiedOnly,
      search,
      sort,
    });

    return NextResponse.json({ suppliers });
  } catch (err: any) {
    console.error("Teklifim GET suppliers error:", err);
    return NextResponse.json({ error: "Tedarikçiler getirilirken bir hata oluştu." }, { status: 500 });
  }
}
