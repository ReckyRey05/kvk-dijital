import { getAdminDb } from "@/lib/firebase/admin";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { generateIcsFile } from "@/lib/teklifimGelsin/integrationUtils";
import { TeklifimCalendarEvent, TeklifimOrder, TeklifimRequest } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return new Response("Yetkisiz erisim. Lutfen giris yapin.", { status: 401 });
    }

    const db = getAdminDb();
    const now = Date.now();

    // 1. Fetch relevant orders
    const [supplierOrdersSnap, businessOrdersSnap] = await Promise.all([
      db.collection("teklifim_orders").where("supplierId", "==", user.uid).limit(20).get(),
      db.collection("teklifim_orders").where("businessId", "==", user.uid).limit(20).get(),
    ]);

    const events: TeklifimCalendarEvent[] = [];

    const processOrder = (order: TeklifimOrder) => {
      const deliveryDate = order.expectedDeliveryDate || (order as any).createdAt + 3 * 86400000;
      events.push({
        id: `cal_ord_${order.id}`,
        title: `Teslimat: ${order.orderNumber || order.id}`,
        description: `${order.businessName} -> ${order.supplierName}. Tutar: ${order.totalPrice} ${order.currency || "TL"}`,
        startDate: deliveryDate,
        endDate: deliveryDate + 2 * 3600000,
        type: "delivery",
        location: (order.deliveryAddress as any)?.city || "Turkiye",
        url: `https://kvkdijital.com/teklifim-gelsin/orders/${order.id}`,
      });
    };

    supplierOrdersSnap.docs.forEach(d => processOrder(d.data() as TeklifimOrder));
    businessOrdersSnap.docs.forEach(d => {
      if (!supplierOrdersSnap.docs.some(sd => sd.id === d.id)) {
        processOrder(d.data() as TeklifimOrder);
      }
    });

    // 2. Fetch requests with deadlines
    const requestsSnap = await db
      .collection("teklifim_requests")
      .where("businessId", "==", user.uid)
      .limit(20)
      .get();

    requestsSnap.docs.forEach(d => {
      const r = d.data() as TeklifimRequest;
      if (r.deadline) {
        const deadlineTime = new Date(r.deadline).getTime() || now + 7 * 86400000;
        events.push({
          id: `cal_req_${r.id}`,
          title: `Talep Kapanisi: ${r.title}`,
          description: `${r.category} kategorisindeki talebiniz icin teklif suresi sona eriyor.`,
          startDate: deadlineTime,
          endDate: deadlineTime + 3600000,
          type: "quote_expiry",
          url: `https://kvkdijital.com/teklifim-gelsin/talepler/${r.id}`,
        });
      }
    });

    // If no events found, provide a placeholder welcome calendar event
    if (events.length === 0) {
      events.push({
        id: `cal_welcome_${user.uid}`,
        title: "Toptancim Cebimde Ticari Takvim",
        description: "Aktif siparis veya teslimat planiniz olustugunda buraya otomatik yansiyacaktir.",
        startDate: now,
        endDate: now + 3600000,
        type: "meeting",
        url: "https://kvkdijital.com/teklifim-gelsin",
      });
    }

    const icsContent = generateIcsFile(events);

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="toptancim-takvim.ics"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("Calendar export error:", err);
    return new Response("Takvim dosyasi olusturulamadi.", { status: 500 });
  }
}
