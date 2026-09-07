import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  updateSupplierAvailability,
} from "@/lib/teklifimGelsin/supplierCenterService";
import { getAdminDb } from "@/lib/firebase/admin";
import { TeklifimProfile, TeklifimSupplierAvailability } from "@/types/teklifimGelsin";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = getAdminDb();
    const snap = await db.collection("teklifim_profiles").doc(auth.user.uid).get();
    const profile = snap.exists ? (snap.data() as TeklifimProfile) : null;

    const availability: TeklifimSupplierAvailability = profile?.availability || {
      isOnline: true,
      isAcceptingOrders: true,
      vacationMode: false,
    };

    return NextResponse.json({ success: true, availability });
  } catch (err: any) {
    console.error("Get availability error:", err);
    return NextResponse.json(
      { error: err?.message || "Durum bilgisi yuklenemedi." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    await updateSupplierAvailability(auth.user.uid, body);

    return NextResponse.json({
      success: true,
      message: "Calisma durumu basariyla guncellendi.",
    });
  } catch (err: any) {
    console.error("Update availability error:", err);
    return NextResponse.json(
      { error: err?.message || "Durum guncellenemedi." },
      { status: 400 }
    );
  }
}
