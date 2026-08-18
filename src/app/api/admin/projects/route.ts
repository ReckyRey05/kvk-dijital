import { NextResponse } from "next/server";
import { verifyAdminServerRequest } from "@/lib/auth/serverAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateProjectInput } from "@/lib/validation/schemas";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler proje oluşturabilir." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const validation = validateProjectInput(rawBody);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Gönderilen proje verisi geçersiz." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const docRef = await db.collection("projects").add({
      ...validation.data,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error("Admin Project Create Error:", error);
    return NextResponse.json(
      { error: "Proje kaydedilirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler proje güncelleyebilir." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const { id, ...projectData } = rawBody;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Geçersiz doküman ID." }, { status: 400 });
    }

    const validation = validateProjectInput(projectData);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Gönderilen proje verisi geçersiz." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("projects").doc(id).update({
      ...validation.data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Project Update Error:", error);
    return NextResponse.json(
      { error: "Proje güncellenirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler proje silebilir." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Geçersiz doküman ID." }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("projects").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Project Delete Error:", error);
    return NextResponse.json(
      { error: "Proje silinirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
