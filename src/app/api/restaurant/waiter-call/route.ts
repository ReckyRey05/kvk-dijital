import { NextResponse } from "next/server";
import { WaiterCall, WaiterCallType } from "@/types/restaurant";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tableId, tableNumber, type, message } = body;

    if (!restaurantId || !tableId || !type) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "restaurantId, tableId ve type zorunludur." },
        { status: 400 }
      );
    }

    const waiterCall: WaiterCall = {
      id: `call_${Date.now()}`,
      restaurantId,
      tableId,
      tableNumber: tableNumber || `Masa ${tableId}`,
      type: type as WaiterCallType,
      message: message || undefined,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      call: waiterCall,
    });
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantWaiterCallAPI", error);
  }
}
