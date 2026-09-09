import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/itemsepeti/orderService";
import { ItemSepetiOrderStatus } from "@/types/marketplace";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "usr_gamer_ali";
    const role = searchParams.get("role") || "buyer";

    const order = await getOrderById(orderId, userId, role);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı veya yetkiniz yok." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sipariş getirilemedi." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { targetStatus, actorId, actorRole, note, proofUrl } = body;

    if (!targetStatus) {
      return NextResponse.json(
        { success: false, error: "targetStatus parametresi gereklidir." },
        { status: 400 }
      );
    }

        // Server Authorization & Tenant Integrity Check
    const existingOrder = await getOrderById(orderId, actorId || "unknown", actorRole || "buyer");
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Sipariş bulunamadı veya bu sipariş üzerinde işlem yetkiniz yok." },
        { status: 403 }
      );
    }

    // Role-specific action constraints:
    // 1. Only buyer of order or admin can confirm completion (COMPLETED)
    if (targetStatus === "COMPLETED" && actorRole !== "admin" && existingOrder.buyerId !== actorId) {
      return NextResponse.json(
        { success: false, error: "Yalnızca siparişin alıcısı veya yönetici teslimatı onaylayabilir." },
        { status: 403 }
      );
    }

    // 2. Only seller of order or admin can mark as DELIVERED
    if (targetStatus === "DELIVERED" && actorRole !== "admin" && existingOrder.sellerId !== actorId) {
      return NextResponse.json(
        { success: false, error: "Yalnızca siparişin satıcısı veya yönetici teslimat bildiriminde bulunabilir." },
        { status: 403 }
      );
    }

    // 3. Only buyer of order or admin can open DISPUTED
    if (targetStatus === "DISPUTED" && actorRole !== "admin" && existingOrder.buyerId !== actorId) {
      return NextResponse.json(
        { success: false, error: "Yalnızca alıcı uyuşmazlık (dispute) başlatabilir." },
        { status: 403 }
      );
    }

    const result = await updateOrderStatus(orderId, targetStatus as ItemSepetiOrderStatus, {
      actorId,
      actorRole,
      note,
      proofUrl,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Sipariş güncellenemedi." },
      { status: 500 }
    );
  }
}
