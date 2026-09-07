import { Metadata } from "next";
import Link from "next/link";
import { Layers, Search, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import TeklifimHeader from "@/components/teklifimGelsin/TeklifimHeader";
import CategoryDiscoveryGrid from "@/components/teklifimGelsin/CategoryDiscoveryGrid";
import SearchBar from "@/components/teklifimGelsin/SearchBar";
import { TeklifimThemeProvider } from "@/context/TeklifimThemeContext";

export const metadata: Metadata = {
  title: "B2B Sektörler ve Toptan Kategoriler | Toptancım Cebimde",
  description:
    "Ambalaj, gıda, temizlik, tekstil, matbaa, hırdavat, ofis ve endüstriyel mutfak toptancıları. Doğrulanmış üreticilerden en avantajlı B2B teklifleri alın.",
};

export default function CategoriesHubPage() {
  return (
    <TeklifimThemeProvider>
      <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
        <TeklifimHeader />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
          {/* HERO SECTION */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Layers className="w-3.5 h-3.5" />
              <span>Pazar Keşfi & Sektör Rehberi</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              B2B Toptan Sektörler & Kategoriler
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Aradığınız hammadde, sarf malzemesi veya toptan ürünü doğrudan onaylı üretici ve toptancılardan temin edin. En rekabetçi fiyat tekliflerini dakikalar içinde toplayın.
            </p>

            <div className="pt-2 max-w-xl mx-auto">
              <SearchBar placeholder="Kategori veya alt kategori içinde ara..." />
            </div>
          </div>

          {/* CATEGORIES GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Tüm Ticari Kategoriler
              </h2>
              <Link
                href="/teklifim-gelsin/requests/new"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Özel Kategori Talebi Oluştur</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <CategoryDiscoveryGrid showSubCategories={true} />
          </section>

          {/* VALUE PROPOSITION BANNER */}
          <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black">
                İşletmeniz İçin Toptan Tedarikçiyi Bulamadınız mı?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                İhtiyaç duyduğunuz teknik şartname veya adetleri belirterek ücretsiz talep formu doldurun. 81 ilden doğrulanmış toptancılar doğrudan size teklif versin.
              </p>
            </div>

            <Link
              href="/teklifim-gelsin/requests/new"
              className="px-6 py-3.5 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-sm shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              <span>Hemen Ücretsiz Talep Oluştur</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </main>
      </div>
    </TeklifimThemeProvider>
  );
}
