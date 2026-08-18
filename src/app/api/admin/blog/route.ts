import { NextResponse } from "next/server";
import { verifyAdminServerRequest } from "@/lib/auth/serverAuth";
import { getAdminDb } from "@/lib/firebase/admin";
import { validateBlogPostInput } from "@/lib/validation/schemas";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler blog oluşturabilir." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const validation = validateBlogPostInput(rawBody);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Gönderilen blog verisi geçersiz." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const docRef = await db.collection("blog_posts").add({
      ...validation.data,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error("Admin Blog Create Error:", error);
    return NextResponse.json(
      { error: "Blog yazısı kaydedilirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler blog güncelleyebilir." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const { id, ...postData } = rawBody;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Geçersiz doküman ID." }, { status: 400 });
    }

    const validation = validateBlogPostInput(postData);
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error || "Gönderilen blog verisi geçersiz." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    await db.collection("blog_posts").doc(id).update({
      ...validation.data,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Blog Update Error:", error);
    return NextResponse.json(
      { error: "Blog yazısı güncellenirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const adminUser = await verifyAdminServerRequest(req);
    if (!adminUser) {
      return NextResponse.json(
        { error: "Yetkisiz işlem. Yalnızca doğrulanmış yöneticiler blog silebilir." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Geçersiz doküman ID." }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("blog_posts").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Blog Delete Error:", error);
    return NextResponse.json(
      { error: "Blog yazısı silinirken bir sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
