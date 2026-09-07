import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getPurchaseHistory } from "@/lib/teklifimGelsin/procurementService";
import { exportPurchasesToCsv } from "@/lib/teklifimGelsin/procurementUtils";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const supplierId = searchParams.get("supplierId") || undefined;
    const status = searchParams.get("status") || undefined;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const format = searchParams.get("format");

    const startDate = startDateStr ? parseInt(startDateStr, 10) : undefined;
    const endDate = endDateStr ? parseInt(endDateStr, 10) : undefined;

    const purchases = await getPurchaseHistory(user.uid, {
      category,
      supplierId,
      status,
      startDate,
      endDate,
    });

    if (format === "csv") {
      const csvData = exportPurchasesToCsv(purchases);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="satin_alma_gecmisi_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ purchases, totalCount: purchases.length });
  } catch (err: any) {
    console.error("Purchase history error:", err);
    return NextResponse.json({ error: "Satin alma gecmisi alinamadi." }, { status: 500 });
  }
}
