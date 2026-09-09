/**
 * İtemSepeti — Initial Catalog Seed Dataset
 * Games, Categories, Game Servers and Sample Products for Dev/Staging/Testing.
 */

import {
  ItemSepetiGame,
  ItemSepetiCategory,
  ItemSepetiProduct,
} from "@/types/marketplace";

export const SEED_GAMES: ItemSepetiGame[] = [
  {
    "id": "game_cs2",
    "slug": "cs2",
    "name": "CS2 (Counter-Strike 2)",
    "publisher": "Valve",
    "isActive": true,
    "supportedProductTypes": [
      "ITEM",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_metin2",
    "slug": "metin2",
    "name": "Metin2",
    "publisher": "Gameforge",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_marmara",
        "name": "Marmara",
        "isActive": true
      },
      {
        "id": "srv_turkiye",
        "name": "Türkiye",
        "isActive": true
      },
      {
        "id": "srv_anadolu",
        "name": "Anadolu",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_valorant",
    "slug": "valorant",
    "name": "Valorant",
    "publisher": "Riot Games",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_pubg",
    "slug": "pubg",
    "name": "PUBG Mobile",
    "publisher": "Tencent",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_steam",
    "slug": "steam",
    "name": "Steam",
    "publisher": "Valve",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_metin2_pvp",
    "slug": "metin2-pvp-serverler",
    "name": "Metin2 PvP Serverler",
    "publisher": "Topluluk",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_pvp_alpar",
        "name": "Alpar2",
        "isActive": true
      },
      {
        "id": "srv_pvp_rohan",
        "name": "Rohan2",
        "isActive": true
      },
      {
        "id": "srv_pvp_astra",
        "name": "Astra2",
        "isActive": true
      },
      {
        "id": "srv_pvp_saltanat",
        "name": "Saltanat MT2",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_lol",
    "slug": "league-of-legends",
    "name": "League of Legends",
    "publisher": "Riot Games",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_knight_online",
    "slug": "knight-online",
    "name": "Knight Online",
    "publisher": "NTT Game",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_destan",
        "name": "Destan",
        "isActive": true
      },
      {
        "id": "srv_dryads",
        "name": "Dryads",
        "isActive": true
      },
      {
        "id": "srv_pandora",
        "name": "Pandora",
        "isActive": true
      },
      {
        "id": "srv_felis",
        "name": "Felis",
        "isActive": true
      },
      {
        "id": "srv_agartha",
        "name": "Agartha",
        "isActive": true
      },
      {
        "id": "srv_zero",
        "name": "Zero",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_rise_online",
    "slug": "rise-online",
    "name": "Rise Online",
    "publisher": "RO Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_aarvad",
        "name": "Aarvad",
        "isActive": true
      },
      {
        "id": "srv_gala",
        "name": "Gala",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_razer_gold",
    "slug": "razer-gold",
    "name": "Razer Gold",
    "publisher": "Razer",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_point_blank",
    "slug": "point-blank",
    "name": "Point Blank",
    "publisher": "Zepetto",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_playstation",
    "slug": "sony-playstation-store-hediye-karti",
    "name": "Sony PlayStation Store",
    "publisher": "Sony Interactive",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_xbox",
    "slug": "xbox-hediye-karti",
    "name": "XBOX Hediye Kartı",
    "publisher": "Microsoft",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_travian",
    "slug": "travian-altin",
    "name": "Travian Altın",
    "publisher": "Travian Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_apex_legends",
    "slug": "apex-legends-coins",
    "name": "Apex Legends",
    "publisher": "Electronic Arts",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_silkroad",
    "slug": "silkroad-online-turkiye-silk",
    "name": "Silkroad Online Türkiye",
    "publisher": "GameGami",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_sro_truva",
        "name": "Truva",
        "isActive": true
      },
      {
        "id": "srv_sro_efes",
        "name": "Efes",
        "isActive": true
      },
      {
        "id": "srv_sro_bergama",
        "name": "Bergama",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_clash_of_clans",
    "slug": "clash-of-clans",
    "name": "Clash of Clans",
    "publisher": "Supercell",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_clash_royale",
    "slug": "clash-royale-yesil-tas",
    "name": "Clash Royale",
    "publisher": "Supercell",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_brawl_stars",
    "slug": "brawl-stars-elmas",
    "name": "Brawl Stars",
    "publisher": "Supercell",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_fc_mobile",
    "slug": "fc-mobile-24",
    "name": "FC Mobile 24",
    "publisher": "EA Sports",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_blade_and_soul",
    "slug": "blade-and-soul-ncoin",
    "name": "Blade and Soul",
    "publisher": "NCSoft",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_whiteout_survival",
    "slug": "whiteout-survival",
    "name": "Whiteout Survival",
    "publisher": "Century Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_cod_mobile",
    "slug": "call-of-duty-mobile",
    "name": "Call of Duty Mobile",
    "publisher": "Activision",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_fortnite",
    "slug": "fortnite",
    "name": "Fortnite",
    "publisher": "Epic Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_wild_rift",
    "slug": "league-of-legends-wild-rift",
    "name": "League of Legends: Wild Rift",
    "publisher": "Riot Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_lords_mobile",
    "slug": "lords-mobile",
    "name": "Lords Mobile",
    "publisher": "IGG",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_pubg_new_state",
    "slug": "pubg-new-state",
    "name": "PUBG New State",
    "publisher": "Krafton",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_roblox",
    "slug": "roblox",
    "name": "Roblox",
    "publisher": "Roblox Corporation",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "DIGITAL_CODE",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_trovo",
    "slug": "trovo",
    "name": "Trovo",
    "publisher": "Tencent",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_webzen",
    "slug": "webzen",
    "name": "Webzen",
    "publisher": "Webzen",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_geforce_now",
    "slug": "geforce-now-game-uyelik",
    "name": "GeForce NOW Game+",
    "publisher": "NVIDIA / Turkcell",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_free_fire",
    "slug": "free-fire",
    "name": "Free Fire",
    "publisher": "Garena",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_rigor_z",
    "slug": "rigor-z",
    "name": "Rigor Z",
    "publisher": "Rigor Z Community",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_black_desert",
    "slug": "black-desert",
    "name": "Black Desert",
    "publisher": "Pearl Abyss",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_bdo_mena",
        "name": "MENA / Türkiye",
        "isActive": true
      },
      {
        "id": "srv_bdo_eu",
        "name": "EU",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_bigpoint",
    "slug": "bigpoint",
    "name": "Bigpoint",
    "publisher": "Bigpoint",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_wolfteam",
    "slug": "joygame-wolfteam",
    "name": "Joygame Wolfteam",
    "publisher": "Joygame",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_darkorbit",
    "slug": "darkorbit",
    "name": "DarkOrbit",
    "publisher": "Bigpoint",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "servers": [
      {
        "id": "srv_do_tr1",
        "name": "Türkiye 1",
        "isActive": true
      },
      {
        "id": "srv_do_tr2",
        "name": "Türkiye 2",
        "isActive": true
      },
      {
        "id": "srv_do_global",
        "name": "Global Amerika",
        "isActive": true
      }
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_legend_online",
    "slug": "legend-online",
    "name": "Legend Online",
    "publisher": "Oasis Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_bombom",
    "slug": "bombom",
    "name": "BomBom",
    "publisher": "Efun",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_discord",
    "slug": "discord",
    "name": "Discord",
    "publisher": "Discord Inc.",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_zula",
    "slug": "zula",
    "name": "ZULA",
    "publisher": "MadByte Games",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_nostale",
    "slug": "nostale",
    "name": "Nostale",
    "publisher": "Gameforge",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_mobile_legends",
    "slug": "mobile-legends",
    "name": "Mobile Legends",
    "publisher": "Moonton",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ACCOUNT"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_rise_guardian",
    "slug": "rise-guardian-sky2",
    "name": "Rise Guardian Sky2",
    "publisher": "Topluluk",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY",
      "ITEM"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_netflix",
    "slug": "netflix-gift-card-tr",
    "name": "Netflix",
    "publisher": "Netflix",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_disney",
    "slug": "disney-plus",
    "name": "Disney Plus",
    "publisher": "The Walt Disney Company",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_blutv",
    "slug": "blutv-epin",
    "name": "BluTV",
    "publisher": "Warner Bros. Discovery",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_exxen",
    "slug": "exxen",
    "name": "Exxen",
    "publisher": "Acun Medya",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_todtv",
    "slug": "tod-tv",
    "name": "TOD TV (beIN Connect)",
    "publisher": "Digiturk",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_paribu_cineverse",
    "slug": "paribu-cineverse",
    "name": "Paribu Cineverse",
    "publisher": "CGV Mars Cinema Group",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_google_play",
    "slug": "google-play-hediye-kodu",
    "name": "Google Play",
    "publisher": "Google",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_apple_itunes",
    "slug": "app-store-itunes-hediye-karti",
    "name": "Apple App Store & iTunes",
    "publisher": "Apple",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_amazon",
    "slug": "amazon-hediye-karti",
    "name": "Amazon TR",
    "publisher": "Amazon",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_bigo_live",
    "slug": "bigo-live",
    "name": "Bigo Live",
    "publisher": "BIGO Technology",
    "isActive": true,
    "supportedProductTypes": [
      "CURRENCY"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  },
  {
    "id": "game_magaza_kartlari",
    "slug": "magaza-hediye-kartlari",
    "name": "Mağaza Hediye Kartları",
    "publisher": "Genel",
    "isActive": true,
    "supportedProductTypes": [
      "DIGITAL_CODE"
    ],
    "createdAt": 1725700000000,
    "updatedAt": 1725700000000
  }
];

export const SEED_CATEGORIES: ItemSepetiCategory[] = [
  {
    "id": "cat_cs2_skins",
    "gameId": "game_cs2",
    "slug": "skins",
    "name": "Silah Skinleri & Bıçaklar",
    "productType": "ITEM",
    "defaultDeliveryMethod": "MANUAL_ITEM",
    "platformFeeRate": 0.05,
    "minPrice": 10,
    "maxPrice": 250000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_cs2_cases",
    "gameId": "game_cs2",
    "slug": "kasalar",
    "name": "Kasalar & Kapsüller",
    "productType": "ITEM",
    "defaultDeliveryMethod": "MANUAL_ITEM",
    "platformFeeRate": 0.05,
    "minPrice": 5,
    "maxPrice": 50000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_metin2_yang",
    "gameId": "game_metin2",
    "slug": "yang",
    "name": "Yang & Won",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.06,
    "minPrice": 20,
    "maxPrice": 100000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_metin2_items",
    "gameId": "game_metin2",
    "slug": "itemler",
    "name": "Efsunlu İtemler & Zırhlar",
    "productType": "ITEM",
    "defaultDeliveryMethod": "MANUAL_ITEM",
    "platformFeeRate": 0.06,
    "minPrice": 50,
    "maxPrice": 200000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_valorant_vp",
    "gameId": "game_valorant",
    "slug": "vp",
    "name": "Valorant Points (VP) E-Pin",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.03,
    "minPrice": 50,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_pubg_uc",
    "gameId": "game_pubg",
    "slug": "uc",
    "name": "Unknown Cash (UC)",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_steam_wallet",
    "gameId": "game_steam",
    "slug": "cuzdan-kodu",
    "name": "Steam Cüzdan Kodları",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.03,
    "minPrice": 20,
    "maxPrice": 5000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_metin2_pvp_pvp_yang",
    "gameId": "game_metin2_pvp",
    "slug": "pvp-yang",
    "name": "PvP Yang & İtem",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 10,
    "maxPrice": 100000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_lol_rp_kodlari",
    "gameId": "game_lol",
    "slug": "rp-kodlari",
    "name": "Riot Points (RP) & E-Pin",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_knight_online_gb_ve_item",
    "gameId": "game_knight_online",
    "slug": "gb-ve-item",
    "name": "Gold Bar (GB) & İtem",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 200000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_rise_online_gold_ve_item",
    "gameId": "game_rise_online",
    "slug": "gold-ve-item",
    "name": "Rise Gold & Eşya",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 100000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_razer_gold_tl_pin",
    "gameId": "game_razer_gold",
    "slug": "tl-pin",
    "name": "Razer Gold TL Pin",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 25,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_point_blank_tg_tam_gold",
    "gameId": "game_point_blank",
    "slug": "tg-tam-gold",
    "name": "Point Blank TG (Tam Gold)",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_playstation_psn_kart",
    "gameId": "game_playstation",
    "slug": "psn-kart",
    "name": "PlayStation Network Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_xbox_game_pass_ve_kod",
    "gameId": "game_xbox",
    "slug": "game-pass-ve-kod",
    "name": "Xbox Hediye Kartı & Pass",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_travian_altin",
    "gameId": "game_travian",
    "slug": "altin",
    "name": "Travian Altın",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_apex_legends_apex_coins",
    "gameId": "game_apex_legends",
    "slug": "apex-coins",
    "name": "Apex Coins & Kodlar",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_silkroad_silk_ve_item",
    "gameId": "game_silkroad",
    "slug": "silk-ve-item",
    "name": "Silk & İtem",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 50000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_clash_of_clans_yesil_tas",
    "gameId": "game_clash_of_clans",
    "slug": "yesil-tas",
    "name": "Yeşil Taş & Hesap",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_clash_royale_elmas_ve_pass",
    "gameId": "game_clash_royale",
    "slug": "elmas-ve-pass",
    "name": "Yeşil Taş & Pass",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_brawl_stars_elmas",
    "gameId": "game_brawl_stars",
    "slug": "elmas",
    "name": "Brawl Stars Elmas",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_fc_mobile_fc_points",
    "gameId": "game_fc_mobile",
    "slug": "fc-points",
    "name": "FC Points & Hesap",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_blade_and_soul_ncoin",
    "gameId": "game_blade_and_soul",
    "slug": "ncoin",
    "name": "Blade & Soul NCoin",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_whiteout_survival_frost_star",
    "gameId": "game_whiteout_survival",
    "slug": "frost-star",
    "name": "Frost Star & Paket",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 25000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_cod_mobile_cp_points",
    "gameId": "game_cod_mobile",
    "slug": "cp-points",
    "name": "CP (COD Points)",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_fortnite_v_bucks",
    "gameId": "game_fortnite",
    "slug": "v-bucks",
    "name": "V-Bucks & Kodlar",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 40,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_wild_rift_wild_cores",
    "gameId": "game_wild_rift",
    "slug": "wild-cores",
    "name": "Wild Cores & Kodlar",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 25,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_lords_mobile_elmas",
    "gameId": "game_lords_mobile",
    "slug": "elmas",
    "name": "Lords Mobile Elmas",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 25,
    "maxPrice": 25000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_pubg_new_state_nc_yukleme",
    "gameId": "game_pubg_new_state",
    "slug": "nc-yukleme",
    "name": "New State NC Yükleme",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_roblox_robux",
    "gameId": "game_roblox",
    "slug": "robux",
    "name": "Robux & Hediye Kartı",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 25000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_trovo_elixir",
    "gameId": "game_trovo",
    "slug": "elixir",
    "name": "Trovo Elixir & Mana",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_webzen_wcoin",
    "gameId": "game_webzen",
    "slug": "wcoin",
    "name": "Webzen Wcoin E-Pin",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_geforce_now_game_plus_kod",
    "gameId": "game_geforce_now",
    "slug": "game-plus-kod",
    "name": "GeForce NOW Paket Kodları",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 5000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_free_fire_elmas",
    "gameId": "game_free_fire",
    "slug": "elmas",
    "name": "Free Fire Elmas",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_rigor_z_gc_ve_item",
    "gameId": "game_rigor_z",
    "slug": "gc-ve-item",
    "name": "Rigor GC & İtem",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_black_desert_inci_ve_gumus",
    "gameId": "game_black_desert",
    "slug": "inci-ve-gumus",
    "name": "İnci, Gümüş & Hesap",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 50000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_bigpoint_kupon_kodlari",
    "gameId": "game_bigpoint",
    "slug": "kupon-kodlari",
    "name": "Bigpoint Kupon Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_wolfteam_joypara_jp",
    "gameId": "game_wolfteam",
    "slug": "joypara-jp",
    "name": "Joypara (JP) & Hesap",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_darkorbit_uridium",
    "gameId": "game_darkorbit",
    "slug": "uridium",
    "name": "DarkOrbit Uridium & Gemi",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 30000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_legend_online_elmas",
    "gameId": "game_legend_online",
    "slug": "elmas",
    "name": "Legend Online Elmas",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_bombom_kupon",
    "gameId": "game_bombom",
    "slug": "kupon",
    "name": "BomBom Kupon & Hesap",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_discord_nitro_ve_boost",
    "gameId": "game_discord",
    "slug": "nitro-ve-boost",
    "name": "Discord Nitro & Boost",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 35,
    "maxPrice": 3000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_zula_za_altin",
    "gameId": "game_zula",
    "slug": "za-altin",
    "name": "Zula Altını (ZA) & Hesap",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_nostale_nosdolar",
    "gameId": "game_nostale",
    "slug": "nosdolar",
    "name": "NosDolar & İtem",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 30000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_mobile_legends_elmas",
    "gameId": "game_mobile_legends",
    "slug": "elmas",
    "name": "Mobile Legends Elmas",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_rise_guardian_para_ve_item",
    "gameId": "game_rise_guardian",
    "slug": "para-ve-item",
    "name": "Oyun İçi Para & İtem",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "CURRENCY_TRADE",
    "platformFeeRate": 0.04,
    "minPrice": 20,
    "maxPrice": 20000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_netflix_hediye_karti",
    "gameId": "game_netflix",
    "slug": "hediye-karti",
    "name": "Netflix Hediye Kartı TR",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 100,
    "maxPrice": 2000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_disney_abonelik_kodu",
    "gameId": "game_disney",
    "slug": "abonelik-kodu",
    "name": "Disney+ Abonelik Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 100,
    "maxPrice": 2500,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_blutv_kupon_kodu",
    "gameId": "game_blutv",
    "slug": "kupon-kodu",
    "name": "BluTV Kupon Kodları",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 1500,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_exxen_uyelik_kodu",
    "gameId": "game_exxen",
    "slug": "uyelik-kodu",
    "name": "Exxen & Spor Üyelik Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 2500,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_todtv_paket_kodu",
    "gameId": "game_todtv",
    "slug": "paket-kodu",
    "name": "TOD TV Paket Kodları",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 100,
    "maxPrice": 5000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_paribu_cineverse_bilet_kodu",
    "gameId": "game_paribu_cineverse",
    "slug": "bilet-kodu",
    "name": "Sinema Bileti & Mısır Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 1500,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_google_play_bakiye_kodu",
    "gameId": "game_google_play",
    "slug": "bakiye-kodu",
    "name": "Google Play Bakiye Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 25,
    "maxPrice": 5000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_apple_itunes_bakiye_kodu",
    "gameId": "game_apple_itunes",
    "slug": "bakiye-kodu",
    "name": "App Store Bakiye Kodu",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 5000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_amazon_hediye_karti",
    "gameId": "game_amazon",
    "slug": "hediye-karti",
    "name": "Amazon TR Hediye Kartı",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_bigo_live_elmas_yukleme",
    "gameId": "game_bigo_live",
    "slug": "elmas-yukleme",
    "name": "Bigo Live Elmas",
    "productType": "CURRENCY",
    "defaultDeliveryMethod": "DIRECT_TRANSFER",
    "platformFeeRate": 0.04,
    "minPrice": 30,
    "maxPrice": 15000,
    "isActive": true,
    "createdAt": 1725700000000
  },
  {
    "id": "cat_magaza_kartlari_alisveris_cekleri",
    "gameId": "game_magaza_kartlari",
    "slug": "alisveris-cekleri",
    "name": "Mağaza Çekleri & Kartlar",
    "productType": "DIGITAL_CODE",
    "defaultDeliveryMethod": "AUTOMATIC_CODE",
    "platformFeeRate": 0.04,
    "minPrice": 50,
    "maxPrice": 10000,
    "isActive": true,
    "createdAt": 1725700000000
  }
];

export const SEED_PRODUCTS: ItemSepetiProduct[] = [
  {
    id: "prod_cs2_ak47_asiimov",
    gameId: "game_cs2",
    gameName: "CS2 (Counter-Strike 2)",
    productType: "ITEM",
    categoryId: "cat_cs2_skins",
    categoryName: "Silah Skinleri & Bıçaklar",
    name: "AK-47 | Asiimov",
    slug: "ak47-asiimov",
    normalizedName: "ak47 asiimov",
    description: "Popüler fütüristik bilim kurgu temalı CS2 tüfek skini.",
    isActive: true,
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "prod_cs2_karambit_doppler",
    gameId: "game_cs2",
    gameName: "CS2 (Counter-Strike 2)",
    productType: "ITEM",
    categoryId: "cat_cs2_skins",
    categoryName: "Silah Skinleri & Bıçaklar",
    name: "★ Karambit | Doppler",
    slug: "karambit-doppler",
    normalizedName: "karambit doppler",
    description: "Kavisli kaplan pençesi bıçak, Doppler fazlı özel desen.",
    isActive: true,
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "prod_metin2_yang_100m",
    gameId: "game_metin2",
    gameName: "Metin2",
    productType: "CURRENCY",
    categoryId: "cat_metin2_yang",
    categoryName: "Yang & Won",
    name: "100M Yang Paketi",
    slug: "100m-yang-paketi",
    normalizedName: "100m yang paketi",
    description: "Sunucu içi teslimatla anında aktarılabilir 100 milyon Yang.",
    isActive: true,
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "prod_valorant_vp_1200",
    gameId: "game_valorant",
    gameName: "Valorant",
    productType: "DIGITAL_CODE",
    categoryId: "cat_valorant_vp",
    categoryName: "Valorant Points (VP) E-Pin",
    name: "Valorant 1200 VP",
    slug: "valorant-1200-vp",
    normalizedName: "valorant 1200 vp",
    description: "Riot Games TR bölgesi uyumlu anında teslim 1200 VP kodu.",
    isActive: true,
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
];

export interface SeedSeller {
  id: string;
  storeName: string;
  storeSlug: string;
  isVerifiedSeller: boolean;
  ratingAverage: number;
  ratingCount: number;
  completedSalesCount: number;
  averageDeliveryMinutes: number;
  memberSinceYears: number;
  bio: string;
}

export const SEED_SELLERS: SeedSeller[] = [
  {
    id: "seller_dragontrader",
    storeName: "DragonTrader",
    storeSlug: "dragontrader",
    isVerifiedSeller: true,
    ratingAverage: 4.9,
    ratingCount: 142,
    completedSalesCount: 142,
    averageDeliveryMinutes: 15,
    memberSinceYears: 2,
    bio: "CS2 ve Metin2 resmi lisanslı takasçısı. 7/24 hızlı ve güvenli teslimat.",
  },
  {
    id: "seller_knifeempire",
    storeName: "KnifeEmpire",
    storeSlug: "knifeempire",
    isVerifiedSeller: true,
    ratingAverage: 5.0,
    ratingCount: 68,
    completedSalesCount: 68,
    averageDeliveryMinutes: 20,
    memberSinceYears: 3,
    bio: "Nadir CS2 bıçakları ve yüksek tier skinler. Anında Steam Trade teklifi.",
  },
  {
    id: "seller_yangmerkezi",
    storeName: "YangMerkezi",
    storeSlug: "yangmerkezi",
    isVerifiedSeller: true,
    ratingAverage: 4.8,
    ratingCount: 310,
    completedSalesCount: 310,
    averageDeliveryMinutes: 10,
    memberSinceYears: 4,
    bio: "Marmara, Türkiye ve Anadolu sunucularında stoktan anında yang teslimatı.",
  },
  {
    id: "seller_epinmarket",
    storeName: "EpinMarket",
    storeSlug: "epinmarket",
    isVerifiedSeller: true,
    ratingAverage: 4.95,
    ratingCount: 520,
    completedSalesCount: 520,
    averageDeliveryMinutes: 1,
    memberSinceYears: 2,
    bio: "Resmi distribütör kodları. 7/24 anında otomatik dijital kod teslimi.",
  },
];

export interface SeedListingItem {
  id: string;
  sellerId: string;
  sellerStoreName: string;
  sellerRating: number;
  sellerRatingCount: number;
  isSellerVerified: boolean;
  productId?: string;
  gameId: string;
  gameName: string;
  gameSlug: string;
  categoryId: string;
  categoryName: string;
  serverId?: string;
  serverName?: string;
  productType: "ITEM" | "CURRENCY" | "DIGITAL_CODE" | "ACCOUNT" | "OTHER_DIGITAL";
  title: string;
  normalizedTitle: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  minQuantity: number;
  deliveryMethod: "AUTOMATIC_CODE" | "MANUAL_ITEM" | "CURRENCY_TRADE" | "DIRECT_TRANSFER" | "ACCOUNT_HANDOFF";
  deliverySlaHours: number;
  images: string[];
  status: "active" | "draft" | "pending_review" | "paused" | "sold_out" | "rejected" | "deleted";
  duplicateFingerprint: string;
  attributes?: Record<string, string | number | boolean>;
  createdAt: number;
  publishedAt: number;
  updatedAt: number;
}

export const SEED_LISTINGS: SeedListingItem[] = [
  {
    id: "lst_cs2_ak47_asiimov_01",
    sellerId: "seller_dragontrader",
    sellerStoreName: "DragonTrader",
    sellerRating: 4.9,
    sellerRatingCount: 142,
    isSellerVerified: true,
    productId: "prod_cs2_ak47_asiimov",
    gameId: "game_cs2",
    gameName: "CS2 (Counter-Strike 2)",
    gameSlug: "cs2",
    categoryId: "cat_cs2_skins",
    categoryName: "Silah Skinleri & Bıçaklar",
    productType: "ITEM",
    title: "AK-47 | Asiimov (Field-Tested) 0.18 Float Temiz Görünüm",
    normalizedTitle: "ak 47 asiimov field tested 0 18 float temiz görünüm",
    description: "Kendi envanterimden temiz AK-47 Asiimov. Field-Tested kondisyonda ancak 0.18 float değeri ile neredeyse Minimal Wear görünümündedir. Steam Takas URL üzerinden 15 dakika içinde teslim edilir.",
    unitPrice: 1850,
    stockQuantity: 1,
    minQuantity: 1,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 1,
    images: ["/images/itemsepeti/listings/cs2_ak47_asiimov.svg"],
    status: "active",
    duplicateFingerprint: "fp_cs2_ak47_asiimov_01",
    attributes: {
      skin: "AK-47 | Asiimov",
      wear: "Field-Tested",
      float: 0.1824,
      statTrak: false,
    },
    createdAt: 1725700100000,
    publishedAt: 1725700100000,
    updatedAt: 1725700100000,
  },
  {
    id: "lst_cs2_karambit_doppler_01",
    sellerId: "seller_knifeempire",
    sellerStoreName: "KnifeEmpire",
    sellerRating: 5.0,
    sellerRatingCount: 68,
    isSellerVerified: true,
    productId: "prod_cs2_karambit_doppler",
    gameId: "game_cs2",
    gameName: "CS2 (Counter-Strike 2)",
    gameSlug: "cs2",
    categoryId: "cat_cs2_skins",
    categoryName: "Silah Skinleri & Bıçaklar",
    productType: "ITEM",
    title: "★ Karambit | Doppler (Factory New) Phase 2 Pembe Galaxy",
    normalizedTitle: "karambit doppler factory new phase 2 pembe galaxy",
    description: "Kusursuz köşe, bol pembe renk dağılımı Phase 2 Galaxy. Steam trade teklifi ile anında gönderilir.",
    unitPrice: 24500,
    stockQuantity: 1,
    minQuantity: 1,
    deliveryMethod: "MANUAL_ITEM",
    deliverySlaHours: 2,
    images: ["/images/itemsepeti/listings/cs2_karambit_doppler.svg"],
    status: "active",
    duplicateFingerprint: "fp_cs2_karambit_doppler_01",
    attributes: {
      skin: "★ Karambit | Doppler",
      wear: "Factory New",
      phase: "Phase 2",
      statTrak: false,
    },
    createdAt: 1725700200000,
    publishedAt: 1725700200000,
    updatedAt: 1725700200000,
  },
  {
    id: "lst_metin2_yang_marmara_01",
    sellerId: "seller_yangmerkezi",
    sellerStoreName: "YangMerkezi",
    sellerRating: 4.8,
    sellerRatingCount: 310,
    isSellerVerified: true,
    productId: "prod_metin2_yang_100m",
    gameId: "game_metin2",
    gameName: "Metin2",
    gameSlug: "metin2",
    categoryId: "cat_metin2_yang",
    categoryName: "Yang & Won",
    serverId: "srv_marmara",
    serverName: "Marmara",
    productType: "CURRENCY",
    title: "Metin2 Marmara 100M Yang (Anında 1. Köy Teslimat)",
    normalizedTitle: "metin2 marmara 100m yang anında 1 köy teslimat",
    description: "Marmara sunucusunda 100M Yang. Ödeme sonrası 1. köy mavi bayrak depo arkasında anında elden ticaret ile verilir.",
    unitPrice: 120,
    stockQuantity: 15,
    minQuantity: 1,
    deliveryMethod: "CURRENCY_TRADE",
    deliverySlaHours: 1,
    images: ["/images/itemsepeti/listings/metin2_yang_100m.svg"],
    status: "active",
    duplicateFingerprint: "fp_metin2_yang_marmara_01",
    attributes: {
      server: "Marmara",
      amount: "100M",
      village: "1. Köy Mavi Depo Arkası",
    },
    createdAt: 1725700300000,
    publishedAt: 1725700300000,
    updatedAt: 1725700300000,
  },
  {
    id: "lst_valorant_vp_1200_01",
    sellerId: "seller_epinmarket",
    sellerStoreName: "EpinMarket",
    sellerRating: 4.95,
    sellerRatingCount: 520,
    isSellerVerified: true,
    productId: "prod_valorant_vp_1200",
    gameId: "game_valorant",
    gameName: "Valorant",
    gameSlug: "valorant",
    categoryId: "cat_valorant_vp",
    categoryName: "Valorant Points (VP) E-Pin",
    productType: "DIGITAL_CODE",
    title: "Valorant 1200 VP Dijital E-Pin Kodu (TR / Otomatik Teslim)",
    normalizedTitle: "valorant 1200 vp dijital e pin kodu tr otomatik teslim",
    description: "Riot Games TR hesaplarında geçerli 1200 VP kodu. Ödeme onaylandığı anda sistem tarafından otomatik olarak teslim edilir.",
    unitPrice: 240,
    stockQuantity: 50,
    minQuantity: 1,
    deliveryMethod: "AUTOMATIC_CODE",
    deliverySlaHours: 1,
    images: ["/images/itemsepeti/listings/valorant_1200_vp.svg"],
    status: "active",
    duplicateFingerprint: "fp_valorant_vp_1200_01",
    attributes: {
      region: "TR",
      points: 1200,
    },
    createdAt: 1725700400000,
    publishedAt: 1725700400000,
    updatedAt: 1725700400000,
  },
  {
    id: "lst_steam_100_wallet_01",
    sellerId: "seller_epinmarket",
    sellerStoreName: "EpinMarket",
    sellerRating: 4.95,
    sellerRatingCount: 520,
    isSellerVerified: true,
    gameId: "game_steam",
    gameName: "Steam",
    gameSlug: "steam",
    categoryId: "cat_steam_wallet",
    categoryName: "Steam Cüzdan Kodları",
    productType: "DIGITAL_CODE",
    title: "Steam 100 TL Cüzdan Kodu (Otomatik Kod)",
    normalizedTitle: "steam 100 tl cüzdan kodu otomatik kod",
    description: "100 TL Steam cüzdan kodu. Satın alma sonrası kod anında panelinizde görünür.",
    unitPrice: 105,
    stockQuantity: 30,
    minQuantity: 1,
    deliveryMethod: "AUTOMATIC_CODE",
    deliverySlaHours: 1,
    images: ["/images/itemsepeti/listings/steam_100_wallet.svg"],
    status: "active",
    duplicateFingerprint: "fp_steam_100_wallet_01",
    attributes: {
      region: "TR",
      amount: "100 TL",
    },
    createdAt: 1725700500000,
    publishedAt: 1725700500000,
    updatedAt: 1725700500000,
  },
  {
    id: "lst_pubg_660_uc_01",
    sellerId: "seller_epinmarket",
    sellerStoreName: "EpinMarket",
    sellerRating: 4.95,
    sellerRatingCount: 520,
    isSellerVerified: true,
    gameId: "game_pubg",
    gameName: "PUBG Mobile",
    gameSlug: "pubg",
    categoryId: "cat_pubg_uc",
    categoryName: "Unknown Cash (UC)",
    productType: "CURRENCY",
    title: "PUBG Mobile 660 UC (Oyuncu ID ile Anında Yükleme)",
    normalizedTitle: "pubg mobile 660 uc oyuncu id ile anında yükleme",
    description: "PUBG Mobile 660 UC paketi. Satın alım sonrası oyuncu ID ve karakter adınız üzerinden doğrudan hesabınıza tanımlanır.",
    unitPrice: 320,
    stockQuantity: 40,
    minQuantity: 1,
    deliveryMethod: "DIRECT_TRANSFER",
    deliverySlaHours: 1,
    images: ["/images/itemsepeti/listings/pubg_mobile_uc.svg"],
    status: "active",
    duplicateFingerprint: "fp_pubg_660_uc_01",
    attributes: {
      region: "Global",
      amount: "660 UC",
    },
    createdAt: 1725700600000,
    publishedAt: 1725700600000,
    updatedAt: 1725700600000,
  },
];
