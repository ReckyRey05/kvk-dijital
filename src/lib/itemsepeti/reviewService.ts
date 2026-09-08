/**
 * İtemSepeti — Review & Seller Reputation Service
 * Post-completion buyer reviews, seller ratings, and store reputation.
 */

import { getAdminDb } from "@/lib/firebase/admin";
import { ItemSepetiReview } from "@/types/marketplace";
import { sendNotification } from "./notificationService";

export interface SubmitReviewInput {
  orderId: string;
  sellerId: string;
  buyerId: string;
  buyerDisplayName: string;
  rating: number; // 1 - 5
  comment?: string;
}

const inMemoryReviews = new Map<string, ItemSepetiReview[]>([
  [
    "DragonTrader",
    [
      {
        id: "rev_seed_1",
        orderId: "ord_101",
        sellerId: "DragonTrader",
        buyerId: "usr_gamer_ali",
        buyerDisplayName: "Ahmet K.",
        rating: 5,
        comment: "Çok hızlı teslimat yaptı, güvenilir satıcı. Teşekkürler!",
        isReported: false,
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: "rev_seed_2",
        orderId: "ord_102",
        sellerId: "DragonTrader",
        buyerId: "usr_gamer_mehmet",
        buyerDisplayName: "Mehmet Y.",
        rating: 5,
        comment: "CS2 skin takası 2 dakikada onaylandı.",
        isReported: false,
        createdAt: Date.now() - 86400000 * 5,
      },
    ],
  ],
]);

export async function submitOrderReview(input: SubmitReviewInput): Promise<{
  success: boolean;
  review?: ItemSepetiReview;
  error?: string;
}> {
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Puan 1 ile 5 arasında olmalıdır." };
  }

  const reviewId = `rev_${input.orderId}`;
  const review: ItemSepetiReview = {
    id: reviewId,
    orderId: input.orderId,
    sellerId: input.sellerId,
    buyerId: input.buyerId,
    buyerDisplayName: input.buyerDisplayName,
    rating: Math.round(input.rating),
    comment: input.comment?.trim(),
    isReported: false,
    createdAt: Date.now(),
  };

  const sellerReviews = inMemoryReviews.get(input.sellerId) || [];
  // Avoid duplicate review on same order
  if (sellerReviews.some((r) => r.orderId === input.orderId)) {
    return { success: false, error: "Bu sipariş için zaten değerlendirme yapılmış." };
  }

  sellerReviews.unshift(review);
  inMemoryReviews.set(input.sellerId, sellerReviews);

  try {
    const db = getAdminDb();
    await db.collection("itemsepeti_reviews").doc(reviewId).set(review);
  } catch {}

  // Notify seller
  await sendNotification({
    userId: input.sellerId,
    event: "ORDER_COMPLETED",
    title: "Yeni Değerlendirme & Yorum!",
    message: `Alıcı ${input.buyerDisplayName} mağazanıza ${input.rating} yıldız verdi.`,
    linkUrl: `/profilim`,
  });

  return { success: true, review };
}

export function getSellerReviews(sellerId: string): ItemSepetiReview[] {
  return inMemoryReviews.get(sellerId) || [];
}

export function calculateSellerReputation(sellerId: string): {
  averageRating: number;
  reviewCount: number;
  positivePercentage: number;
} {
  const reviews = inMemoryReviews.get(sellerId) || [];
  if (reviews.length === 0) {
    return { averageRating: 5.0, reviewCount: 0, positivePercentage: 100 };
  }

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Number((totalRating / reviews.length).toFixed(1));
  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const positivePercentage = Math.round((positiveReviews / reviews.length) * 100);

  return {
    averageRating,
    reviewCount: reviews.length,
    positivePercentage,
  };
}
