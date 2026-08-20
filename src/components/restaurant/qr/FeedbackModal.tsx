"use client";

import { useState } from "react";
import { X, Star, ExternalLink, CheckCircle2, MessageSquare, AlertTriangle } from "lucide-react";
import { MenuLanguage } from "@/types/restaurant";
import { DICTIONARY } from "@/lib/restaurant/i18n";
import { useRestaurantStore } from "@/lib/restaurant/store";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
  googleReviewUrl?: string;
  lang: MenuLanguage;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  tableNumber,
  googleReviewUrl = "https://maps.google.com",
  lang,
}: FeedbackModalProps) {
  const { addManagerAlert } = useRestaurantStore();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const t = DICTIONARY[lang];

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating >= 4) {
      window.open(googleReviewUrl, "_blank");
    } else {
      // Dispatch urgent bad-review shield alert to cashier & manager
      addManagerAlert({
        id: `alert_neg_${Date.now()}`,
        tableId: tableNumber,
        tableNumber,
        type: "NEGATIVE_FEEDBACK",
        rating,
        message: comment || "Müşteri servis veya yemekten memnun kalmadı (Düşük Puan).",
        createdAt: new Date().toISOString(),
        isResolved: false,
      });
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0a0f0f] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] p-6 space-y-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">{t.rateUsTitle}</h3>
            <p className="text-xs text-foreground/60">{t.rateUsDesc}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">{t.privateFeedback}</h4>
            <p className="text-xs text-foreground/70">{t.privateFeedbackDesc}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 5-Star Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* If 4-5 stars: Google Maps CTA Banner */}
            {rating >= 4 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                <span className="text-xs font-bold text-amber-300 block">
                  Bizi Google Haritalar'da değerlendirerek destek olun!
                </span>
                <p className="text-[11px] text-foreground/70">
                  5 yıldızlı yorumunuz restoranımızın görünürlüğünü ve kalitesini artırır.
                </p>
              </div>
            ) : (
              /* If 1-3 stars: Private Feedback textarea */
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 block">
                  Neyi Daha İyi Yapabilirdik? (Özel Yönetici Mesajı)
                </label>
                <textarea
                  placeholder="Yemek, servis veya bekleme süresi hakkında öneriniz..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-accent resize-none"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-accent text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-accent/90 transition-all shadow-xl shadow-accent/20 cursor-pointer"
            >
              {rating >= 4 ? (
                <>
                  <span>{t.googleReviewBtn}</span>
                  <ExternalLink className="w-4 h-4" />
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>Geri Bildirimi İlet</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
