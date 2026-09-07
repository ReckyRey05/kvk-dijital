import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  getQuoteTemplates,
  createQuoteTemplate,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function GET(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const templates = await getQuoteTemplates(auth.user.uid);
    return NextResponse.json({ success: true, templates });
  } catch (err: any) {
    console.error("Get quote templates error:", err);
    return NextResponse.json(
      { error: err?.message || "Sablonlar yuklenemedi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const template = await createQuoteTemplate(auth.user.uid, body);
    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (err: any) {
    console.error("Create quote template error:", err);
    return NextResponse.json(
      { error: err?.message || "Sablon olusturulamadi." },
      { status: 400 }
    );
  }
}
