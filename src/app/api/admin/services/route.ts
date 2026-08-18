import { NextResponse } from "next/server";
import { verifyAdminServerRequest } from "@/lib/auth/serverAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateServiceInput } from "@/lib/validation/schemas";
import { FieldValue } from "firebase-admin/firestore";
import { RATE_LIMITS } from "@/config/rateLimit";
import { getClientIp, checkRateLimit, createRateLimitResponse, parseJsonWithByteLimit } from "@/lib/security/rateLimit";
import { createSecureServerErrorResponse } from "@/lib/security/errorResponse";

export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler hizmet oluşturabilir." },
        { status: 401 }
      );
    }

    // Rate Limit Checks (30 requests / 15 min)
    const clientIp = getClientIp(req);
    const ipCheck = checkRateLimit(`adminApi:ip:${clientIp}`, RATE_LIMITS.adminApi.ip);
    if (!ipCheck.allowed) return createRateLimitResponse(ipCheck);

    const adminEmail = (adminUser.email || adminUser.uid).toLowerCase();
    const accountCheck = checkRateLimit(`adminApi:account:${adminEmail}`, RATE_LIMITS.adminApi.account);
    if (!accountCheck.allowed) return createRateLimitResponse(accountCheck);

    // Stream Raw JSON Body with 2 MB Byte Limit
    const parseResult = await parseJsonWithByteLimit(req, 2 * 1024 * 1024);
    if (!parseResult.ok) return parseResult.errorResponse;

    const validation = validateServiceInput(parseResult.data);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Gönderilen hizmet verisi geçersiz." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const docRef = await db.collection("services").add({
      ...validation.data,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    return createSecureServerErrorResponse("AdminServiceCreate", error, "Hizmet kaydedilirken bir sunucu hatası oluştu.");
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler hizmet güncelleyebilir." },
        { status: 401 }
      );
    }

    // Rate Limit Checks
    const clientIp = getClientIp(req);
    const ipCheck = checkRateLimit(`adminApi:ip:${clientIp}`, RATE_LIMITS.adminApi.ip);
    if (!ipCheck.allowed) return createRateLimitResponse(ipCheck);

    const adminEmail = (adminUser.email || adminUser.uid).toLowerCase();
    const accountCheck = checkRateLimit(`adminApi:account:${adminEmail}`, RATE_LIMITS.adminApi.account);
    if (!accountCheck.allowed) return createRateLimitResponse(accountCheck);

    // Stream Raw JSON Body with 2 MB Byte Limit
    const parseResult = await parseJsonWithByteLimit(req, 2 * 1024 * 1024);
    if (!parseResult.ok) return parseResult.errorResponse;

    const { id, ...serviceData } = parseResult.data || {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Geçersiz doküman ID." }, { status: 400 });
    }

    const validation = validateServiceInput(serviceData);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Gönderilen hizmet verisi geçersiz." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("services").doc(id).update({
      ...validation.data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return createSecureServerErrorResponse("AdminServiceUpdate", error, "Hizmet güncellenirken bir sunucu hatası oluştu.");
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler hizmet silebilir." },
        { status: 401 }
      );
    }

    // Rate Limit Checks
    const clientIp = getClientIp(req);
    const ipCheck = checkRateLimit(`adminApi:ip:${clientIp}`, RATE_LIMITS.adminApi.ip);
    if (!ipCheck.allowed) return createRateLimitResponse(ipCheck);

    const adminEmail = (adminUser.email || adminUser.uid).toLowerCase();
    const accountCheck = checkRateLimit(`adminApi:account:${adminEmail}`, RATE_LIMITS.adminApi.account);
    if (!accountCheck.allowed) return createRateLimitResponse(accountCheck);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Geçersiz doküman ID." }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("services").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return createSecureServerErrorResponse("AdminServiceDelete", error, "Hizmet silinirken bir sunucu hatası oluştu.");
  }
}
