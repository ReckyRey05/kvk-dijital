import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { aggregateSpendAnalytics } from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimOrder } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const db = getAdminDb();
    const snap = await db
      .collection("teklifim_orders")
      .where("businessId", "==", user.uid)
      .get();

    const orders: TeklifimOrder[] = [];
    snap.forEach((doc) => orders.push(doc.data() as TeklifimOrder));

    const analytics = aggregateSpendAnalytics(orders);

    return NextResponse.json({ analytics });
  } catch (err: any) {
    console.error("Procurement analytics error:", err);
    return NextResponse.json({ error: "Analitik verileri alinamadi." }, { status: 500 });
  }
}
