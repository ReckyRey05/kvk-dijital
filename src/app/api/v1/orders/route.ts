import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateApiKeyRequest } from "@/lib/teklifimGelsin/integrationService";
import { TeklifimOrder } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "orders:read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limitParam = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const db = getAdminDb();
    // Query orders for this user either as supplier or business
    const [supplierOrdersSnap, businessOrdersSnap] = await Promise.all([
      db.collection("teklifim_orders").where("supplierId", "==", auth.userId).limit(limitParam).get(),
      db.collection("teklifim_orders").where("businessId", "==", auth.userId).limit(limitParam).get(),
    ]);

    const orderMap = new Map<string, TeklifimOrder>();
    supplierOrdersSnap.docs.forEach(doc => {
      orderMap.set(doc.id, doc.data() as TeklifimOrder);
    });
    businessOrdersSnap.docs.forEach(doc => {
      orderMap.set(doc.id, doc.data() as TeklifimOrder);
    });

    let orders = Array.from(orderMap.values());
    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    orders.sort((a, b) => ((b as any).createdAt || 0) - ((a as any).createdAt || 0));

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.slice(0, limitParam),
    });
  } catch (err: any) {
    console.error("API v1 orders GET error:", err);
    return NextResponse.json({ error: "Siparisler getirilemedi." }, { status: 500 });
  }
}
