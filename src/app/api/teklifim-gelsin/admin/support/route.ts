import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  listAdminSupportTickets,
  createSupportTicket,
} from "@/lib/teklifimGelsin/adminOperationsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "support.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const tickets = await listAdminSupportTickets(status);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Destek talepleri alinirken hata olustu." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminWithPermission(req, "support.manage");
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { subject, category, description, priority } = body;

    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: "subject, category ve description alanlari zorunludur." },
        { status: 400 }
      );
    }

    const ticket = await createSupportTicket(auth.user, {
      subject,
      category,
      description,
      priority,
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Destek talebi olusturulurken hata olustu." },
      { status: 500 }
    );
  }
}
