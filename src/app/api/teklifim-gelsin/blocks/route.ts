import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  blockUser,
  unblockUser,
  getUserBlocks,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const blocks = await getUserBlocks(user.uid);
    return NextResponse.json({ blocks });
  } catch (err: any) {
    console.error("Teklifim GET blocks error:", err);
    return NextResponse.json({ error: "Engellenenler listesi alınamadı." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { blockedId, blockedName, reason } = body;

    if (!blockedId) {
      return NextResponse.json({ error: "Engellenecek kullanıcı ID gerekli." }, { status: 400 });
    }
    if (blockedId === user.uid) {
      return NextResponse.json({ error: "Kendinizi engelleyemezsiniz." }, { status: 400 });
    }

    const block = await blockUser(user.uid, blockedId, blockedName, reason);
    return NextResponse.json({ success: true, block });
  } catch (err: any) {
    console.error("Teklifim POST block error:", err);
    return NextResponse.json(
      { error: err.message || "Engelleme işlemi başarısız oldu." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const blockedId = searchParams.get("blockedId");

    if (!blockedId) {
      return NextResponse.json({ error: "Engeli kaldırılacak kullanıcı ID gerekli." }, { status: 400 });
    }

    await unblockUser(user.uid, blockedId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Teklifim DELETE block error:", err);
    return NextResponse.json(
      { error: err.message || "Engel kaldırma işlemi başarısız oldu." },
      { status: 400 }
    );
  }
}
