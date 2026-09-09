import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { SEED_LISTINGS } from "@/lib/itemsepeti/catalogSeedData";
import { ItemSepetiListing, ItemSepetiListingStatus } from "@/types/marketplace";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get("sellerId") || "seller_demo_user";

  try {
    const db = getAdminDb();
    const snap = await db
      .collection("itemsepeti_listings")
      .where("sellerId", "==", sellerId)
      .get();

    if (!snap.empty) {
      const items = snap.docs.map((d) => d.data() as ItemSepetiListing);
      return NextResponse.json({ success: true, listings: items });
    } else {
      return NextResponse.json({ success: true, listings: [] });
    }
  } catch {}

  // In-memory fallback: if demo account, return seed; otherwise return empty list
  if (sellerId === "seller_demo_user" || sellerId === "usr_gamer_ali") {
    const demoListings: ItemSepetiListing[] = SEED_LISTINGS.map((l, idx) => ({
      ...l,
      sellerId,
      status: idx === 3 ? ("paused" as ItemSepetiListingStatus) : ("active" as ItemSepetiListingStatus),
    }));
    return NextResponse.json({ success: true, listings: demoListings });
  }

  return NextResponse.json({ success: true, listings: [] });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, status, unitPrice, stockQuantity } = body;

    if (!listingId) {
      return NextResponse.json({ success: false, error: "listingId gerekli" }, { status: 400 });
    }

    try {
      const db = getAdminDb();
      const ref = db.collection("itemsepeti_listings").doc(listingId);
      const updates: any = { updatedAt: Date.now() };
      if (status) updates.status = status;
      if (unitPrice !== undefined) updates.unitPrice = Number(unitPrice);
      if (stockQuantity !== undefined) updates.stockQuantity = Number(stockQuantity);

      await ref.update(updates);
    } catch {}

    return NextResponse.json({ success: true, message: "İlan güncellendi." });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId");

  if (!listingId) {
    return NextResponse.json({ success: false, error: "listingId gerekli" }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_listings").doc(listingId).delete();
  } catch {}

  return NextResponse.json({ success: true, message: "İlan silindi." });
}
