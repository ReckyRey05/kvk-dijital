import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";
import { Search, CreditCard, PackageCheck, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Nasıl Çalışır? — Güvenli Escrow Sistemi | İtemSepeti",
  description: "İtemSepeti'nde alışveriş nasıl yapılır? İlan seçimi, güvenli ödeme emanet (escrow) havuzu ve teslimat onay süreçleri.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "İlanı Seç",
      desc: "İstediğin oyunu, sunucuyu ve ürünü ara. Satıcı puanlarını, teslimat hızını ve fiyatları karşılaştırarak sepetine ekle.",
      icon: Search,
    },
    {
      step: "02",
      title: "Ödemeni Yap",
      desc: "Kredi kartı veya bakiye ile ödemeni gerçekleştir. Tutar satıcıya değil, İtemSepeti Escrow (Emanet) havuzuna aktarılır ve kilitlenir.",
      icon: CreditCard,
    },
    {
      step: "03",
      title: "Ürünü Teslim Al",
      desc: "Satıcı dijital kodunu açıklar veya oyun içi takası tamamlar. Ürünü kontrol edip onay verdiğinde bakiye satıcıya geçer.",
      icon: PackageCheck,
    },
  ];

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
          {/* HEADER INTRO */}
          <section className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-inherit">
              Nasıl Çalışır?
            </h1>
            <p className="text-sm sm:text-base text-[#9498A6] leading-relaxed">
              İtemSepeti, alıcı ile satıcı arasındaki tüm ticareti bağımsız emanet (escrow) sistemiyle korur.
            </p>
          </section>

          {/* 3 CLEAN STEPS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="p-6 rounded-[14px] border space-y-4 select-none relative"
                  style={{
                    backgroundColor: "rgba(27, 30, 39, 0.5)",
                    borderColor: "#282C3A",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#E8A33D] px-2 py-0.5 rounded-[6px] bg-[#E8A33D]/10 border border-[#E8A33D]/20">
                      Adım {s.step}
                    </span>
                    <Icon className="w-5 h-5 text-[#9498A6]" />
                  </div>

                  <h2 className="text-lg font-bold text-inherit">{s.title}</h2>
                  <p className="text-xs sm:text-sm text-[#9498A6] leading-relaxed max-w-[80ch]">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </section>

          {/* ESCROW EXPLANATION CALLOUT */}
          <section
            className="p-6 sm:p-8 rounded-[18px] border space-y-3"
            style={{
              backgroundColor: "rgba(27, 30, 39, 0.4)",
              borderColor: "#282C3A",
            }}
          >
            <div className="flex items-center gap-2 text-[#34D399]">
              <ShieldCheck className="w-5 h-5" />
              <h2 className="text-base font-bold">Escrow (Emanet) Güvencesi Nedir?</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#9498A6] leading-relaxed max-w-[80ch]">
              Ödediğiniz para doğrudan satıcının hesabına gitmez. İtemSepeti emanet kasasında bekletilir.
              Satıcı ürünü teslim edene ve siz teslim aldığınızı onaylayana kadar para satıcıya aktarılmaz.
              Herhangi bir aksaklık durumunda 7/24 destek ekibimiz devreye girerek paranızı iade eder.
            </p>
            <div className="pt-4">
              <Link href="/itemsepeti">
                <ItemSepetiButton variant="primary" size="md">
                  Pazarı Keşfet
                </ItemSepetiButton>
              </Link>
            </div>
          </section>
        </main>

        <ItemSepetiFooter />
      </div>
    </ItemSepetiThemeProvider>
  );
}
