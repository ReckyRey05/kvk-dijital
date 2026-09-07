import { NextResponse } from "next/server";
import {
  verifyAdminWithPermission,
  getAdminCategories,
  saveAdminCategory,
} from "@/lib/teklifimGelsin/adminOperationsService";

export async function GET(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "categories.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const categories = await getAdminCategories();
    return NextResponse.json({ success: true, categories, count: categories.length });
  } catch (err: any) {
    console.error("Admin get categories error:", err);
    return NextResponse.json({ error: "Kategoriler alinamadi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAdminWithPermission(req, "categories.manage");
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Kategori ismi zorunludur." }, { status: 400 });
    }

    const saved = await saveAdminCategory(auth.user!, auth.role!, body);
    return NextResponse.json({ success: true, category: saved }, { status: 201 });
  } catch (err: any) {
    console.error("Admin save category error:", err);
    return NextResponse.json({ error: "Kategori kaydedilemedi." }, { status: 500 });
  }
}
