import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateApiKeyRequest, dispatchPlatformEvent } from "@/lib/teklifimGelsin/integrationService";
import { TeklifimRequest } from "@/types/teklifimGelsin";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "requests:read");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limitParam = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const db = getAdminDb();
    let query: FirebaseFirestore.Query = db.collection("teklifim_requests");

    if (category) {
      query = query.where("category", "==", category);
    }
    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.limit(limitParam).get();
    const requests = snapshot.docs.map(doc => doc.data() as TeklifimRequest);

    return NextResponse.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err: any) {
    console.error("API v1 requests GET error:", err);
    return NextResponse.json({ error: "Talepler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await validateApiKeyRequest(req, "requests:write");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (!body.title || !body.category || !body.quantity || !body.unit) {
      return NextResponse.json(
        { error: "Gecersiz talep verisi. 'title', 'category', 'quantity' ve 'unit' zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const requestId = `req_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const now = Date.now();

    const newRequest: TeklifimRequest = {
      id: requestId,
      businessId: auth.userId!,
      businessName: body.businessName || "Entegre Isletme",
      businessCity: body.businessCity || body.city || "Istanbul",
      businessPhone: body.businessPhone || "",
      businessEmail: body.businessEmail || "",
      title: body.title.trim(),
      category: body.category,
      productName: body.productName || body.title.trim(),
      quantity: Number(body.quantity),
      unit: body.unit,
      deliveryDays: Number(body.deliveryDays) || 7,
      city: body.city || body.businessCity || "Istanbul",
      district: body.district || "",
      description: body.description || "",
      status: "open",
      offerCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("teklifim_requests").doc(requestId).set(newRequest);

    // Dispatch integration event
    await dispatchPlatformEvent({
      type: "request.created",
      entityId: requestId,
      entityType: "request",
      actorId: auth.userId,
      payload: {
        requestId,
        title: newRequest.title,
        category: newRequest.category,
        quantity: newRequest.quantity,
        unit: newRequest.unit,
        city: newRequest.city,
      },
    });

    return NextResponse.json(
      {
        success: true,
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("API v1 requests POST error:", err);
    return NextResponse.json({ error: "Talep olusturulamadi." }, { status: 500 });
  }
}
