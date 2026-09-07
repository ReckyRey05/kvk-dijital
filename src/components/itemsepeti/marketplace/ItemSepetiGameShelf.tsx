import React from "react";
import Link from "next/link";
import { ItemSepetiProductType } from "@/types/marketplace";

export interface GameShelfItem {
  id: string;
  slug: string;
  name: string;
  shortTag: string;
  productTypes: ItemSepetiProductType[];
  accentColor?: string;
}

export const POPULAR_GAMES_SHELF: GameShelfItem[] = [
  {
    id: "game_cs2",
    slug: "cs2",
    name: "CS2",
    shortTag: "Skin & Kasa",
    productTypes: ["ITEM"],
  },
  {
    id: "game_metin2",
    slug: "metin2",
    name: "Metin2",
    shortTag: "Yang & Won & İtem",
    productTypes: ["CURRENCY", "ITEM"],
  },
  {
    id: "game_valorant",
    slug: "valorant",
    name: "Valorant",
    shortTag: "VP & Kod",
    productTypes: ["DIGITAL_CODE"],
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
  },
];

export default function ItemSepetiGameShelf({
  activeSlug,
}: {
  activeSlug?: string;
}) {
  return (
    <nav
      aria-label="Oyun Rafı"
      className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 select-none"
    >
      {POPULAR_GAMES_SHELF.map((game) => {
        const isActive = activeSlug === game.slug;
        return (
          <Link
            key={game.slug}
            href={`/kategori/${game.slug}`}
            className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-xs transition-all whitespace-nowrap ${
              isActive
                ? "bg-[#E8A33D] text-[#12141A] font-bold shadow-sm"
                : "text-[#9498A6] hover:text-[#EDEEF2] hover:bg-white/[0.04]"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-[6px] text-[10px] font-black flex items-center justify-center tracking-tighter ${
                isActive
                  ? "bg-[#12141A]/20 text-[#12141A]"
                  : "bg-black/40 text-[#E8A33D] group-hover:bg-[#E8A33D]/20"
              }`}
            >
              {game.name.substring(0, 2).toUpperCase()}
            </span>
            <span className="font-semibold text-inherit">{game.name}</span>
            <span
              className={`text-[10px] font-normal hidden sm:inline ${
                isActive ? "text-[#12141A]/70" : "text-[#9498A6]/60"
              }`}
            >
              {game.shortTag}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
