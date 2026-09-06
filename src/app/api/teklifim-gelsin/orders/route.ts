import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  getUserTeklifimOrders,
  createOrderFromAgreement,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";

    const orders = await getUserTeklifimOrders(user.uid, status);
    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("Teklifim get orders error:", err);
    return NextResponse.json(
      { error: err.message || "Siparişler alınırken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { agreementId, deliveryMethod, deliveryAddress, notes } = body;

    if (!agreementId) {
      return NextResponse.json(
        { error: "agreementId parametresi zorunludur." },
        { status: 400 }
      );
    }

    const order = await createOrderFromAgreement(agreementId, user.uid, {
      deliveryMethod,
      deliveryAddress,
      notes,
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error("Teklifim create order error:", err);
    return NextResponse.json(
      { error: err.message || "Sipariş oluşturulurken bir hata oluştu." },
      { status: 400 }
    );
  }
}
