import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ItemSepetiThemeProvider } from "@/context/ItemSepetiThemeContext";
import ItemSepetiHeader from "@/components/itemsepeti/layout/ItemSepetiHeader";
import ItemSepetiFooter from "@/components/itemsepeti/layout/ItemSepetiFooter";
import ItemSepetiLiveSupportWidget from "@/components/itemsepeti/support/ItemSepetiLiveSupportWidget";
import { getGames } from "@/lib/itemsepeti/catalogService";
import { ArrowRight, ShieldCheck, Sparkles, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Tüm Oyunlar ve Kategoriler (55+ Oyun) | İtemSepeti",
  description:
    "Metin2, CS2, Knight Online, Valorant, Rise Online, PUBG Mobile, Steam ve 50'den fazla oyunda epin, item, yang, skin ve hediye kartlarını güvenle satın alın.",
  alternates: {
    canonical: "/oyunlar",
  },
};

export default async function AllGamesAndCategoriesPage() {
  const allGames = await getGames();

  // Categorize games into intuitive tabs/groups
  const mmorpgSlugs = [
    "metin2",
    "metin2-pvp-serverler",
    "knight-online",
    "rise-online",
    "silkroad-online-turkiye-silk",
    "black-desert",
    "nostale",
    "blade-and-soul-ncoin",
    "rise-guardian-sky2",
    "darkorbit",
  ];

  const competitiveFpsSlugs = [
    "cs2",
    "valorant",
    "league-of-legends",
    "point-blank",
    "joygame-wolfteam",
    "zula",
    "apex-legends-coins",
    "fortnite",
    "rigor-z",
  ];

  const mobileSlugs = [
    "pubg-mobile",
    "pubg-new-state",
    "free-fire",
    "mobile-legends",
    "brawl-stars-elmas",
    "clash-of-clans",
    "clash-royale-yesil-tas",
    "fc-mobile-24",
    "call-of-duty-mobile",
    "league-of-legends-wild-rift",
    "lords-mobile",
    "whiteout-survival",
    "roblox",
    "bombom",
    "legend-online",
    "travian-altin",
    "bigo-live",
    "trovo",
  ];

  const giftCardsAndMediaSlugs = [
    "steam",
    "razer-gold",
    "sony-playstation-store-hediye-karti",
    "xbox-hediye-karti",
    "geforce-now-game-uyelik",
    "netflix-gift-card-tr",
    "disney-plus",
    "blutv-epin",
    "exxen",
    "tod-tv",
    "paribu-cineverse",
    "google-play-hediye-kodu",
    "app-store-itunes-hediye-karti",
    "amazon-hediye-karti",
    "discord",
    "webzen",
    "bigpoint",
    "magaza-hediye-kartlari",
  ];

  const getSectionGames = (slugList: string[]) =>
    allGames.filter((g) => slugList.includes(g.slug));

  const mmorpgGames = getSectionGames(mmorpgSlugs);
  const fpsGames = getSectionGames(competitiveFpsSlugs);
  const mobileGames = getSectionGames(mobileSlugs);
  const digitalGiftGames = getSectionGames(giftCardsAndMediaSlugs);

  const categorizedSlugs = new Set([
    ...mmorpgSlugs,
    ...competitiveFpsSlugs,
    ...mobileSlugs,
    ...giftCardsAndMediaSlugs,
  ]);
  const otherGames = allGames.filter((g) => !categorizedSlugs.has(g.slug));

  const sections = [
    {
      title: "MMORPG & Online Rol Yapma Oyunları",
      description: "Yang, Won, Gold Bar (GB), item, karakter ve sunucu içi transfer pazarı.",
      badge: "Piyasa Hacmi Yüksek",
      games: mmorpgGames,
    },
    {
      title: "FPS, MOBA & Rekabetçi PC Oyunları",
      description: "Skin, bıçak, Riot Points (RP), Valorant Points (VP) ve e-pin teslimatı.",
      badge: "Anında Teslimat",
      games: fpsGames,
    },
    {
      title: "Mobil Oyunlar & Dijital Jetonlar",
      description: "UC, Elmas, Yeşil Taş, CP, Robux ve oyuncu ID ile anında yükleme.",
      badge: "Mobil Popüler",
      games: mobileGames,
    },
    {
      title: "Dijital Hediye Kartları, E-Pin & Yayın Abonelikleri",
      description: "Steam, PlayStation, Xbox, Netflix, Disney+, Google Play ve cüzdan kodları.",
      badge: "7/24 Otomatik Kod",
      games: digitalGiftGames,
    },
  ];

  if (otherGames.length > 0) {
    sections.push({
      title: "Diğer Oyunlar ve Servisler",
      description: "Tüm ek oyun içi ürünler ve servisler.",
      badge: "Geniş Katalog",
      games: otherGames,
    });
  }

  return (
    <ItemSepetiThemeProvider>
      <div className="flex flex-col min-h-screen">
        <ItemSepetiHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
          {/* HEADER HERO */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#D99532]/10 text-[#D99532] border border-[#D99532]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Genişletilmiş Oyun ve Dijital Ürün Kataloğu</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-inherit">
              Tüm Oyunlar & Kategoriler
            </h1>

            <p className="text-sm text-[#9498A6]">
              İtemSepeti güvencesiyle 55&apos;ten fazla popüler online oyun, MMORPG sunucuları,
              e-pinler, cüzdan kodları ve dijital hediye kartları arasında dilediğiniz kategoriyi seçin.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[#9498A6]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" /> 24 Saat Escrow Koruması
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#D99532]" /> {allGames.length} Aktif Oyun / Kategori
              </span>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="space-y-12">
            {sections.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#D99532]" />
                      <h2 className="text-base sm:text-lg font-bold text-inherit">
                        {sec.title}
                      </h2>
                    </div>
                    <p className="text-xs text-[#9498A6] mt-0.5">{sec.description}</p>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#D99532]/10 text-[#D99532] border border-[#D99532]/20">
                    {sec.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sec.games.map((g) => (
                    <Link
                      key={g.id}
                      href={`/kategori/${g.slug}`}
                      className="group p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between h-32 bg-white dark:bg-[#161921] border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] dark:hover:border-[#D99532] hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="w-8 h-8 rounded-lg bg-[#D99532]/10 text-[#D99532] font-black text-xs flex items-center justify-center tracking-tight border border-[#D99532]/20 group-hover:bg-[#D99532] group-hover:text-white transition-colors">
                            {g.name.substring(0, 2).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#9498A6] uppercase tracking-wider font-semibold">
                            {g.publisher || "Oyun"}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-inherit group-hover:text-[#D99532] transition-colors line-clamp-2">
                          {g.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-[11px] text-[#9498A6] group-hover:text-[#D99532] transition-colors border-t border-black/5 dark:border-white/5">
                        <span className="font-medium">İlanları İncele</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>

        <ItemSepetiFooter />
        <ItemSepetiLiveSupportWidget />
      </div>
    </ItemSepetiThemeProvider>
  );
}
