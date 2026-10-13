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

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
          {/* HEADER HERO */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-inherit">
              Tüm Oyunlar & Kategoriler
            </h1>

            <p className="text-xs sm:text-sm text-[#69717D] dark:text-[#8E97A4]">
              {allGames.length} popüler oyun ve dijital kategoride güvenli emanet korumalı pazar.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-[#69717D] dark:text-[#8E97A4]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0D8259]" /> Emanet Koruması
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#0F625C] dark:text-[#168B83]" /> {allGames.length} Aktif Kategori
              </span>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="space-y-10">
            {sections.map((sec, idx) => (
              <section key={idx} className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-[#E5E8EB] dark:border-[#2A313C] gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0F625C] dark:bg-[#168B83]" />
                      <h2 className="text-sm sm:text-base font-bold text-inherit">
                        {sec.title}
                      </h2>
                    </div>
                    <p className="text-xs text-[#69717D] dark:text-[#8E97A4] mt-0.5">{sec.description}</p>
                  </div>
                  <span className="self-start sm:self-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-[5px] bg-[#F0F4F3] dark:bg-[#20252D] text-[#0F625C] dark:text-[#168B83] border border-[#E5E8EB] dark:border-[#2A313C]">
                    {sec.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {sec.games.map((g) => (
                    <Link
                      key={g.id}
                      href={`/kategori/${g.slug}`}
                      className="group p-3.5 rounded-[10px] border transition-all duration-150 flex flex-col justify-between h-28 bg-white dark:bg-[#181C22] border-[#E5E8EB] dark:border-[#2A313C] hover:border-[#0F625C]/60 dark:hover:border-[#168B83]/60 hover:shadow-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="w-7 h-7 rounded-[6px] bg-[#F0F4F3] dark:bg-[#20252D] text-[#0F625C] dark:text-[#168B83] font-bold text-xs flex items-center justify-center tracking-tight border border-[#E5E8EB] dark:border-[#2A313C] group-hover:bg-[#0F625C] group-hover:text-white transition-colors">
                            {g.name.substring(0, 2).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#8D96A3] uppercase tracking-wider font-semibold">
                            {g.publisher || "Oyun"}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-semibold text-inherit group-hover:text-[#0F625C] dark:group-hover:text-[#168B83] transition-colors line-clamp-1">
                          {g.name}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 text-[11px] text-[#69717D] dark:text-[#8E97A4] group-hover:text-[#0F625C] dark:group-hover:text-[#168B83] transition-colors border-t border-black/5 dark:border-white/5">
                        <span className="font-medium">İlanları Gör</span>
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
