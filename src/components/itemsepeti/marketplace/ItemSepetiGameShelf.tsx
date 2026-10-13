"use client";

import React from "react";
import Link from "next/link";
import { ItemSepetiProductType } from "@/types/marketplace";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

export interface GameShelfItem {
  id: string;
  slug: string;
  name: string;
  shortTag: string;
  productTypes: ItemSepetiProductType[];
  badgeText?: string;
}

export const POPULAR_GAMES_SHELF: GameShelfItem[] = [
  {
    id: "game_cs2",
    slug: "cs2",
    name: "CS2",
    shortTag: "Skin & Kasa",
    productTypes: ["ITEM"],
    badgeText: "Popüler",
  },
  {
    id: "game_metin2",
    slug: "metin2",
    name: "Metin2",
    shortTag: "Yang & Won",
    productTypes: ["CURRENCY", "ITEM"],
    badgeText: "Hızlı Pazar",
  },
  {
    id: "game_valorant",
    slug: "valorant",
    name: "Valorant",
    shortTag: "VP E-Pin",
    productTypes: ["DIGITAL_CODE"],
    badgeText: "Otomatik",
  },
  {
    id: "game_pubg",
    slug: "pubg",
    name: "PUBG Mobile",
    shortTag: "UC Yükleme",
    productTypes: ["CURRENCY"],
  },
  {
    id: "game_steam",
    slug: "steam",
    name: "Steam",
    shortTag: "Cüzdan Kodu",
    productTypes: ["DIGITAL_CODE"],
    badgeText: "Anında",
  },
  {
    id: "game_knight_online",
    slug: "knight-online",
    name: "Knight Online",
    shortTag: "GB & İtem",
    productTypes: ["CURRENCY", "ITEM"],
    badgeText: "Canlı",
  },
  {
    id: "game_lol",
    slug: "league-of-legends",
    name: "League of Legends",
    shortTag: "RP E-Pin",
    productTypes: ["DIGITAL_CODE"],
  },
  {
    id: "game_rise_online",
    slug: "rise-online",
    name: "Rise Online",
    shortTag: "Gold & Eşya",
    productTypes: ["CURRENCY", "ITEM"],
  },
  {
    id: "game_roblox",
    slug: "roblox",
    name: "Roblox",
    shortTag: "Robux",
    productTypes: ["CURRENCY"],
  },
  {
    id: "game_razer_gold",
    slug: "razer-gold",
    name: "Razer Gold",
    shortTag: "TL Pin",
    productTypes: ["DIGITAL_CODE"],
  },
  {
    id: "game_metin2_pvp",
    slug: "metin2-pvp-serverler",
    name: "Metin2 PvP",
    shortTag: "Serverler",
    productTypes: ["CURRENCY", "ITEM"],
  },
  {
    id: "game_brawl_stars",
    slug: "brawl-stars-elmas",
    name: "Brawl Stars",
    shortTag: "Elmas",
    productTypes: ["CURRENCY"],
  },
  {
    id: "game_wolfteam",
    slug: "joygame-wolfteam",
    name: "Wolfteam",
    shortTag: "Joypara",
    productTypes: ["CURRENCY"],
  },
  {
    id: "game_zula",
    slug: "zula",
    name: "ZULA",
    shortTag: "Altın",
    productTypes: ["CURRENCY"],
  },
];

export default function ItemSepetiGameShelf({
  activeSlug,
}: {
  activeSlug?: string;
}) {
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  return (
    <nav
      aria-label="Oyun Keşif Şeridi"
      className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 select-none"
    >
      {POPULAR_GAMES_SHELF.map((game) => {
        const isActive = activeSlug === game.slug;
        return (
          <Link
            key={game.slug}
            href={`/kategori/${game.slug}`}
            className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs transition-all whitespace-nowrap border ${
              isActive
                ? "bg-[#0F625C] text-white border-[#0F625C] font-semibold shadow-xs"
                : isDark
                ? "bg-[#181C22] border-[#2A313C] text-[#EDEEF2] hover:border-[#0F625C]/50 hover:bg-[#20252D]"
                : "bg-white border-[#E5E8EB] text-[#15191E] hover:border-[#0F625C]/50 hover:bg-[#F0F4F3]"
            }`}
          >
            {/* GAME MONOGRAM */}
            <span
              className={`w-5 h-5 rounded-[4px] text-[10px] font-bold flex items-center justify-center tracking-tighter ${
                isActive
                  ? "bg-black/20 text-white"
                  : isDark
                  ? "bg-black/40 text-[#168B83]"
                  : "bg-[#F0F4F3] text-[#0F625C]"
              }`}
            >
              {game.name.substring(0, 2).toUpperCase()}
            </span>

            {/* NAME */}
            <span className="font-semibold text-inherit">{game.name}</span>

            {/* SHORT TAG */}
            <span
              className={`text-[10px] font-normal hidden sm:inline ${
                isActive
                  ? "text-white/80"
                  : isDark
                  ? "text-[#8E97A4]"
                  : "text-[#69717D]"
              }`}
            >
              {game.shortTag}
            </span>

            {/* OPTIONAL BADGE */}
            {game.badgeText && !isActive && (
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] hidden md:inline ${
                  isDark
                    ? "bg-white/5 text-[#8E97A4]"
                    : "bg-[#F0F4F3] text-[#69717D]"
                }`}
              >
                {game.badgeText}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
