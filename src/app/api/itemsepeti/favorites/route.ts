import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId gerekli." }, { status: 400 });
    }

    try {
      const db = getAdminDb();
      const snap = await db
        .collection("itemsepeti_favorites")
        .where("userId", "==", userId)
        .get();

      const favorites = snap.docs.map((d) => d.data());
      return NextResponse.json({ success: true, favorites });
    } catch {
      return NextResponse.json({ success: true, favorites: [] });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, listingId } = body;

    if (!userId || !listingId) {
      return NextResponse.json({ success: false, error: "userId ve listingId zorunludur." }, { status: 400 });
    }

    const docId = `fav_${userId}_${listingId}`;
    const db = getAdminDb();
    await db.collection("itemsepeti_favorites").doc(docId).set({
      id: docId,
      userId,
      listingId,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true, favorited: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, listingId } = body;

    if (!userId || !listingId) {
      return NextResponse.json({ success: false, error: "userId ve listingId zorunludur." }, { status: 400 });
    }

    const docId = `fav_${userId}_${listingId}`;
    const db = getAdminDb();
    await db.collection("itemsepeti_favorites").doc(docId).delete();

    return NextResponse.json({ success: true, favorited: false });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
