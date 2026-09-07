import { NextResponse } from "next/server";
import {
  verifySupplierAccess,
  updateQuoteTemplate,
  deleteQuoteTemplate,
} from "@/lib/teklifimGelsin/supplierCenterService";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const body = await req.json();
    await updateQuoteTemplate(id, auth.user.uid, body);

    return NextResponse.json({ success: true, message: "Sablon guncellendi." });
  } catch (err: any) {
    console.error("Update quote template error:", err);
    return NextResponse.json(
      { error: err?.message || "Sablon guncellenemedi." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifySupplierAccess(req);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    await deleteQuoteTemplate(id, auth.user.uid);

    return NextResponse.json({ success: true, message: "Sablon silindi." });
  } catch (err: any) {
    console.error("Delete quote template error:", err);
    return NextResponse.json(
      { error: err?.message || "Sablon silinemedi." },
      { status: 400 }
    );
  }
}
