import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { TeklifimCoupon } from "@/types/teklifimGelsin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "finance.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = getAdminDb();
    const snap = await db.collection("teklifim_coupons").orderBy("createdAt", "desc").get();
    const coupons = snap.docs.map((d) => d.data() as TeklifimCoupon);

    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Kuponlar alinirken hata olustu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "settings.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { code, discountType, discountValue, validUntil, maxUses, maxUsesPerUser, applicablePlans } = body;

    if (!code || !discountType || discountValue === undefined) {
      return NextResponse.json(
        { error: "code, discountType ve discountValue alanlari zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const cleanCode = code.toUpperCase().trim();
    const now = Date.now();

    const coupon: TeklifimCoupon = {
      id: `cpn_${cleanCode}`,
      code: cleanCode,
      discountType: discountType === "percent" ? "percent" : "fixed",
      discountValue: Number(discountValue),
      validFrom: now,
      validUntil: validUntil ? Number(validUntil) : now + 365 * 86400000,
      maxUses: maxUses !== undefined ? Number(maxUses) : 100,
      currentUses: 0,
      maxUsesPerUser: maxUsesPerUser !== undefined ? Number(maxUsesPerUser) : 1,
      usedBy: {},
      applicablePlans: Array.isArray(applicablePlans) ? applicablePlans : undefined,
      isActive: true,
      createdAt: now,
    };

    await db.collection("teklifim_coupons").doc(cleanCode).set(coupon);

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Kupon olusturulurken hata olustu." },
      { status: 500 }
    );
  }
}
