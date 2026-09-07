import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateApiKeyRequest, dispatchPlatformEvent } from "@/lib/teklifimGelsin/integrationService";
import { TeklifimOffer, TeklifimRequest } from "@/types/teklifimGelsin";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "offers:read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("requestId");
    const limitParam = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("teklifim_offers");

    if (requestId) {
      query = query.where("requestId", "==", requestId);
    } else {
      // By default query offers where supplierId is the user
      query = query.where("supplierId", "==", auth.userId);
    }

    const snapshot = await query.limit(limitParam).get();
    const offers = snapshot.docs.map(doc => doc.data() as TeklifimOffer);

    return NextResponse.json({
      success: true,
      count: offers.length,
      offers,
    });
  } catch (err: any) {
    console.error("API v1 offers GET error:", err);
    return NextResponse.json({ error: "Teklifler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "offers:write");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (!body.requestId || body.unitPrice == null) {
      return NextResponse.json(
        { error: "Gecersiz teklif verisi. 'requestId' ve 'unitPrice' zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const reqDoc = await db.collection("teklifim_requests").doc(body.requestId).get();
    if (!reqDoc.exists) {
      return NextResponse.json({ error: "Talep bulunamadi." }, { status: 404 });
    }

    const requestData = reqDoc.data() as TeklifimRequest;
    const offerId = `off_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = Date.now();
    const unitPrice = Number(body.unitPrice);
    const quantity = requestData.quantity || 1;
    const totalPrice = Number(body.totalPrice) || unitPrice * quantity;

    const newOffer: TeklifimOffer = {
      id: offerId,
      requestId: body.requestId,
      requestTitle: requestData.title,
      businessId: requestData.businessId,
      supplierId: auth.userId!,
      supplierName: body.supplierName || "Entegre Tedarikci",
      supplierCity: body.supplierCity || "Istanbul",
      supplierPhone: body.supplierPhone || "",
      supplierEmail: body.supplierEmail || "",
      unitPrice,
      totalPrice,
      currency: body.currency || "TRY",
      deliveryDays: Number(body.deliveryDays) || 3,
      description: body.description || "",
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("teklifim_offers").doc(offerId).set(newOffer);

    // Update offers count on request
    await db.collection("teklifim_requests").doc(body.requestId).update({
      offerCount: (requestData.offerCount || (requestData as any).offersCount || 0) + 1,
      updatedAt: now,
    });

    // Dispatch integration event
    await dispatchPlatformEvent({
      type: "offer.created",
      entityId: offerId,
      entityType: "offer",
      actorId: auth.userId,
      recipientId: requestData.businessId,
      payload: {
        offerId,
        requestId: requestData.id,
        requestTitle: requestData.title,
        supplierName: newOffer.supplierName,
        totalPrice: newOffer.totalPrice,
        currency: newOffer.currency,
        deliveryDays: newOffer.deliveryDays,
        recipientEmail: requestData.businessEmail,
        recipientPhone: requestData.businessPhone,
      },
    });

    return NextResponse.json(
      {
        success: true,
        offer: newOffer,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("API v1 offers POST error:", err);
    return NextResponse.json({ error: "Teklif olusturulamadi." }, { status: 500 });
  }
}
