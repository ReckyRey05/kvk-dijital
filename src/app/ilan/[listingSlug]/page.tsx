import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import {
  ItemSepetiPrice,
  ItemSepetiRating,
  ItemSepetiStockBadge,
  ItemSepetiDeliveryBadge,
  ItemSepetiSellerBadge,
} from "@/components/itemsepeti/marketplace/MarketplacePrimitives";
import { ShieldCheck, Clock, CheckCircle2, Zap } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listingSlug: string }>;
}): Promise<Metadata> {
  const { listingSlug } = await params;
  return {
    title: "AK-47 | Asiimov (Field-Tested) Satın Al | İtemSepeti",
    description: "CS2 AK-47 Asiimov Field-Tested skini güvenli escrow emanet koruması ile İtemSepeti'nde. Hemen satın alın ve anında Steam takasıyla teslim alın.",
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ listingSlug: string }>;
}) {
  const { listingSlug } = await params;

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
          {/* BREADCRUMB */}
          <nav aria-label="Ekmek Kırıntısı" className="flex items-center gap-2 text-xs text-[#9498A6]">
            <Link href="/itemsepeti" className="hover:text-inherit transition-colors">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/kategori/cs2" className="hover:text-inherit transition-colors">
              CS2
            </Link>
            <span>/</span>
            <span className="text-inherit font-medium">AK-47 | Asiimov (Field-Tested)</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT 2 COLS: PRODUCT DETAILS & DESCRIPTION */}
            <div className="lg:col-span-2 space-y-6">
              {/* MAIN PRODUCT HEADER */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-[6px] bg-black/20 border border-white/5 text-[#9498A6]">
                    CS2 (Counter-Strike 2) &bull; Tüfek
                  </span>
                  <ItemSepetiDeliveryBadge method="MANUAL_ITEM" slaHours={1} />
                  <ItemSepetiStockBadge stock={1} />
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-inherit leading-tight">
                  AK-47 | Asiimov (Field-Tested) 0.18 Float Temiz Görünüm
                </h1>
              </div>

              {/* PRODUCT IMAGE PLACEHOLDER SURFACE (14px radius, no neon glow) */}
              <div
                className="w-full h-64 sm:h-80 rounded-[14px] border flex flex-col items-center justify-center p-6 text-center space-y-2 select-none"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.6)",
                  borderColor: "#282C3A",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-[#E8A33D] font-black text-xl">
                  CS2
                </div>
                <span className="text-sm font-semibold text-inherit">AK-47 | Asiimov</span>
                <span className="text-xs text-[#9498A6]">Float Değeri: 0.18249 &bull; Desen İndeksi: 341</span>
              </div>

              {/* LISTING DESCRIPTION */}
              <div
                className="p-6 rounded-[14px] border space-y-4"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.4)",
                  borderColor: "#282C3A",
                }}
              >
                <h2 className="text-base font-bold text-inherit">İlan Açıklaması</h2>
                <div className="text-sm text-[#9498A6] leading-relaxed space-y-2 max-w-[80ch]">
                  <p>
                    Kendi envanterimden temiz AK-47 Asiimov. Field-Tested kondisyonda ancak 0.18 float değeri ile neredeyse Minimal Wear görünümündedir.
                  </p>
                  <p>
                    Satın alma işleminizin ardından Steam Takas Linkiniz (Trade URL) üzerinden en geç 1 saat içinde takas teklifi gönderilir.
                  </p>
                </div>
              </div>

              {/* HOW DELIVERY WORKS FOR THIS LISTING */}
              <div
                className="p-5 rounded-[14px] border space-y-3"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.3)",
                  borderColor: "#282C3A",
                }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9498A6]">
                  Teslimat Bilgisi
                </h3>
                <ul className="text-xs text-[#9498A6] space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                    <span>Ödemeniz siz takası kabul edip onaylayana kadar İtemSepeti Escrow havuzunda güvendedir.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E8A33D] shrink-0" />
                    <span>Satıcının ortalama teslimat süresi: 15 dakika (Maksimum SLA: 1 saat).</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* RIGHT COL: BUY BOX & SELLER PROFILE CARD */}
            <div className="space-y-5">
              {/* PRIMARY PURCHASE CARD (14px radius, clear pricing, single primary CTA) */}
              <div
                className="p-6 rounded-[14px] border space-y-5 sticky top-24"
                style={{
                  backgroundColor: "rgba(27, 30, 39, 0.8)",
                  borderColor: "#282C3A",
                }}
              >
                <div className="space-y-1">
                  <span className="text-xs text-[#9498A6] font-medium">Toplam Tutar</span>
                  <div className="flex items-baseline justify-between">
                    <ItemSepetiPrice amount={1850} size="lg" />
                    <span className="text-[11px] text-[#34D399] font-medium">Komisyon Dahil</span>
                  </div>
                </div>

                {/* SINGLE MAIN ACTION BUTTON — NO ARROW ICON */}
                <ItemSepetiButton variant="primary" size="lg" fullWidth>
                  Satın Al
                </ItemSepetiButton>

                {/* TRUST BADGE */}
                <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#9498A6]">
                  <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                  <span>Escrow Güvencesi: Teslim almadan para satıcıya aktarılmaz.</span>
                </div>

                {/* SELLER SUMMARY BOX */}
                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-xs text-[#9498A6] font-medium block">Satıcı Bilgileri</span>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-inherit">DragonTrader</span>
                        <ItemSepetiSellerBadge isVerified={true} />
                      </div>
                      <span className="text-[11px] text-[#9498A6]">Üyelik: 2 Yıl &bull; 142 Başarılı Satış</span>
                    </div>
                    <ItemSepetiRating score={4.9} count={142} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
