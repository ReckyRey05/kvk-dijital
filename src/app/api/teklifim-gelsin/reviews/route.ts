import { NextResponse } from "next/server";
import { verifyTeklifimUser } from "@/lib/teklifimGelsin/teklifimAuth";
import {
  addTeklifimReview,
  getSupplierReviews,
  canUserReviewSupplier,
} from "@/lib/teklifimGelsin/teklifimService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");
    const requestId = searchParams.get("requestId");

    // Check if user can review this request
    if (requestId) {
      const user = await verifyTeklifimUser(req);
      if (!user) {
        return NextResponse.json({ canReview: false, reason: "Giriş yapılmalı." }, { status: 401 });
      }
      const canReviewStatus = await canUserReviewSupplier(user.uid, requestId);
      return NextResponse.json(canReviewStatus);
    }

    if (!supplierId) {
      return NextResponse.json({ error: "Tedarikçi ID gerekli." }, { status: 400 });
    }

    const reviews = await getSupplierReviews(supplierId);
    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("Teklifim GET reviews error:", err);
    return NextResponse.json({ error: "Değerlendirmeler getirilemedi." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await verifyTeklifimUser(req);
    if (!user) {
      return NextResponse.json({ error: "Lütfen giriş yapın." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { requestId, rating, comment, isAnonymous } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Talep ID gerekli." }, { status: 400 });
    }
    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return NextResponse.json({ error: "Puan 1 ile 5 arasında olmalıdır." }, { status: 400 });
    }
    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Lütfen kısa bir değerlendirme yorumu yazın." }, { status: 400 });
    }

    const review = await addTeklifimReview(user.uid, {
      requestId,
      rating: Number(rating),
      comment: comment.trim(),
      isAnonymous: !!isAnonymous,
    });

    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    console.error("Teklifim POST review error:", err);
    return NextResponse.json(
      { error: err.message || "Değerlendirme kaydedilemedi." },
      { status: 400 }
    );
  }
}
