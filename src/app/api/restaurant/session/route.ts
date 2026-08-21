import { NextResponse } from "next/server";
import { createTableSession, validateTableSession } from "@/lib/restaurant/session";
import { assertTableOwnership } from "@/lib/restaurant/tenantGuard";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tableId, deviceFingerprint, action, token } = body;

    if (!restaurantId || !tableId) {
      return NextResponse.json(
        { error: "INVALID_REQUEST", message: "restaurantId ve tableId zorunludur." },
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

    // Action 1: VALIDATE EXISTING TOKEN
    if (action === "VALIDATE" && token) {
      const result = validateTableSession(token, verifiedTable.restaurantId, verifiedTable.id, deviceFingerprint);
      return NextResponse.json({
        success: result.valid,
        error: result.error,
        remainingMinutes: result.remainingMinutes,
      });
    }

    // Action 2: CREATE / INITIALIZE FRESH 15-MINUTE SESSION
    const session = createTableSession(
      verifiedTable.restaurantId,
      verifiedTable.id,
      verifiedTable.tableNumber,
      deviceFingerprint || "web_client",
      15
    );

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      token: session.token,
      expiresAt: session.expiresAt,
      remainingMinutes: 15,
    });
  } catch (error) {
    return createSecureServerErrorResponse("RestaurantSessionAPI", error);
  }
}

