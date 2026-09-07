import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  getUserOrgRole,
  createProcurementRequest,
  getProcurementPolicy,
} from "@/lib/teklifimGelsin/procurementService";
import {
  hasOrgPermission,
  aggregateSpendAnalytics,
  extractFrequentlyPurchasedItems,
} from "@/lib/teklifimGelsin/procurementUtils";
import { TeklifimOrder, TeklifimProduct, TeklifimRequest } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const db = getAdminDb();
    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);

    // 1. Fetch Requests for business
    const requestsSnap = await db
      .collection("teklifim_requests")
      .where("businessId", "==", businessId)
      .get();

    let activeRequestsCount = 0;
    let pendingApprovalsCount = 0;
    let requests: TeklifimRequest[] = [];

    requestsSnap.forEach((doc) => {
      const r = doc.data() as TeklifimRequest;
      requests.push(r);
      if (r.status === "published" || r.status === "bidding" || r.status === "offers_received") {
        activeRequestsCount++;
      }
      if (r.approvalStatus === "pending_approval") {
        pendingApprovalsCount++;
      }
    });

    // 2. Fetch Pending Offers
    const offersSnap = await db
      .collection("teklifim_offers")
      .where("businessId", "==", businessId)
      .where("status", "==", "submitted")
      .get();
    const pendingOffersCount = offersSnap.size;

    // 3. Fetch Orders
    const ordersSnap = await db
      .collection("teklifim_orders")
      .where("businessId", "==", businessId)
      .get();

    let activeOrdersCount = 0;
    let orders: TeklifimOrder[] = [];

    ordersSnap.forEach((doc) => {
      const o = doc.data() as TeklifimOrder;
      orders.push(o);
      if (o.status === "preparing" || o.status === "shipped" || o.status === "ready_for_dispatch") {
        activeOrdersCount++;
      }
    });

    // 4. Fetch Products for catalog price matching in frequently purchased items
    const productsSnap = await db
      .collection("teklifim_products")
      .where("status", "==", "published")
      .limit(100)
      .get();
    const products: TeklifimProduct[] = [];
    productsSnap.forEach((doc) => products.push(doc.data() as TeklifimProduct));

    // 5. Compute real metrics
    const spendSummary = aggregateSpendAnalytics(orders);
    const frequentlyPurchased = extractFrequentlyPurchasedItems(orders, products);
    const policy = await getProcurementPolicy(businessId);

    return NextResponse.json({
      activeRequestsCount,
      pendingOffersCount,
      pendingApprovalsCount,
      activeOrdersCount,
      spendSummary,
      frequentlyPurchased: frequentlyPurchased.slice(0, 8),
      policy,
      userRole: orgRole,
      todayMetrics: {
        pendingRequests: activeRequestsCount,
        offersReceived: pendingOffersCount,
        pendingApprovals: pendingApprovalsCount,
        activeOrders: activeOrdersCount,
      },
    });
  } catch (err: any) {
    console.error("Procurement dashboard error:", err);
    return NextResponse.json({ error: "Satin alma verileri alinamadi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erisim. Lutfen giris yapin." }, { status: 401 });
    }

    const body = await req.json();
    const businessId = user.uid;
    const orgRole = await getUserOrgRole(businessId, user.uid);

    if (!hasOrgPermission(orgRole, "create_request")) {
      return NextResponse.json(
        { error: "Satin alma talebi olusturma yetkiniz bulunmamaktadir." },
        { status: 403 }
      );
    }

    const request = await createProcurementRequest(businessId, body, {
      id: user.uid,
      name: user.email.split("@")[0],
      role: orgRole,
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (err: any) {
    console.error("Create procurement request error:", err);
    return NextResponse.json({ error: err.message || "Talep olusturulamadi." }, { status: 500 });
  }
}
