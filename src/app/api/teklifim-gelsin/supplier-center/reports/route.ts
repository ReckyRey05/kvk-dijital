import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  getSupplierSalesReportData,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format");

    const reportData = await getSupplierSalesReportData(auth.user.uid);

    if (format === "csv") {
      return new Response(reportData.csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="satis-raporu-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      totalRevenue: reportData.totalRevenue,
      completedCount: reportData.completedCount,
      categoryBreakdown: reportData.categoryBreakdown,
      monthlyTrend: reportData.monthlyTrend,
      topCustomers: reportData.topCustomers,
    });
  } catch (err: any) {
    console.error("Sales reports error:", err);
    return NextResponse.json(
      { error: err?.message || "Rapor olusturulamadi." },
      { status: 500 }
    );
  }
}
