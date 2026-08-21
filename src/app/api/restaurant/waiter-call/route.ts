import { NextResponse } from "next/server";
import { WaiterCall, WaiterCallType } from "@/types/restaurant";
import { assertTableOwnership } from "@/lib/restaurant/tenantGuard";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tableId, type, message } = body;

    if (!restaurantId || !tableId || !type) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "restaurantId, tableId ve type zorunludur." },
        { status: 400 }
      );
    }

    // 1. Strict Tenant & Table Ownership Verification
    const tableGuard = assertTableOwnership(restaurantId, tableId);
    if (!tableGuard.allowed || !tableGuard.data) {
      return NextResponse.json(
        { error: "TENANT_OR_TABLE_INVALID", message: tableGuard.error || "Masa veya restoran geçersiz." },
        { status: tableGuard.statusCode || 404 }
      );
    }

    const verifiedTable = tableGuard.data;

    const waiterCall: WaiterCall = {
      id: `call_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      restaurantId: verifiedTable.restaurantId,
      tableId: verifiedTable.id,
      tableNumber: verifiedTable.tableNumber,
      type: type as WaiterCallType,
      message: typeof message === "string" ? message.trim().slice(0, 200) : undefined,
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

