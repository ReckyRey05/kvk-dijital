import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminWithPermission } from "@/lib/teklifimGelsin/adminOperationsService";
import { getPlansList } from "@/lib/teklifimGelsin/subscriptionService";
import { TeklifimSubscriptionPlan } from "@/types/teklifimGelsin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "finance.view");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const plans = await getPlansList(true);
    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Planlar alinirken hata olustu." },
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
    const { id, tier, name, description, targetRole, monthlyPrice, yearlyPrice, limits, features, isActive, trialDays } = body;

    if (!tier || !name || monthlyPrice === undefined) {
      return NextResponse.json(
        { error: "tier, name ve monthlyPrice alanlari zorunludur." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const now = Date.now();
    const planId = id || `plan_${tier}_v${Date.now()}`;

    // Read previous version if editing
    let version = 1;
    if (id) {
      const existingDoc = await db.collection("teklifim_subscription_plans").doc(id).get();
      if (existingDoc.exists) {
        version = ((existingDoc.data() as any).version || 1) + 1;
      }
    }

    const plan: TeklifimSubscriptionPlan = {
      id: planId,
      tier,
      name: name.trim(),
      description: description || "",
      targetRole: targetRole || "all",
      version,
      monthlyPrice: Number(monthlyPrice),
      yearlyPrice: Number(yearlyPrice) || Number(monthlyPrice) * 10,
      yearlyDiscountPercent: Math.round(((Number(monthlyPrice) * 12 - (Number(yearlyPrice) || Number(monthlyPrice) * 10)) / (Number(monthlyPrice) * 12)) * 100),
      limits: limits || {},
      features: features || {},
      isActive: isActive !== false,
      trialDays: trialDays !== undefined ? Number(trialDays) : 14,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("teklifim_subscription_plans").doc(planId).set(plan, { merge: true });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Plan kaydedilirken hata olustu." },
      { status: 500 }
    );
  }
}
