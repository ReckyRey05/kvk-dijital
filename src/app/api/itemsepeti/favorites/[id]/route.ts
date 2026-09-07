import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { success: false, error: "listingId ve userId gereklidir." },
        { status: 400 }
      );
    }

    const docId = `fav_${userId}_${id}`;
    const db = getAdminDb();
    await db.collection("itemsepeti_favorites").doc(docId).delete();

    return NextResponse.json({ success: true, removed: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
