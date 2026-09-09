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
    id: "game_cs2",
    slug: "cs2",
    name: "CS2 (Counter-Strike 2)",
    publisher: "Valve",
    isActive: true,
    supportedProductTypes: ["ITEM", "ACCOUNT"],
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "game_metin2",
    slug: "metin2",
    name: "Metin2",
    publisher: "Gameforge",
    isActive: true,
    supportedProductTypes: ["CURRENCY", "ITEM", "ACCOUNT"],
    servers: [
      { id: "srv_marmara", name: "Marmara", isActive: true },
      { id: "srv_turkiye", name: "Türkiye", isActive: true },
      { id: "srv_anadolu", name: "Anadolu", isActive: true },
    ],
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "game_valorant",
    slug: "valorant",
    name: "Valorant",
    publisher: "Riot Games",
    isActive: true,
    supportedProductTypes: ["DIGITAL_CODE", "ACCOUNT"],
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "game_pubg",
    slug: "pubg",
    name: "PUBG Mobile",
    publisher: "Tencent",
    isActive: true,
    supportedProductTypes: ["CURRENCY", "ACCOUNT"],
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
  {
    id: "game_steam",
    slug: "steam",
    name: "Steam",
    publisher: "Valve",
    isActive: true,
    supportedProductTypes: ["DIGITAL_CODE"],
    createdAt: 1725700000000,
    updatedAt: 1725700000000,
  },
];

export const SEED_CATEGORIES: ItemSepetiCategory[] = [
  {
    id: "cat_cs2_skins",
    gameId: "game_cs2",
    slug: "skins",
    name: "Silah Skinleri & Bıçaklar",
    productType: "ITEM",
    defaultDeliveryMethod: "MANUAL_ITEM",
    platformFeeRate: 0.05, // %5
    minPrice: 10,
    maxPrice: 250000,
    isActive: true,
    createdAt: 1725700000000,
  },
  {
    id: "cat_cs2_cases",
    gameId: "game_cs2",
    slug: "kasalar",
    name: "Kasalar & Kapsüller",
    productType: "ITEM",
    defaultDeliveryMethod: "MANUAL_ITEM",
    platformFeeRate: 0.05,
    minPrice: 5,
    maxPrice: 50000,
    isActive: true,
    createdAt: 1725700000000,
  },
  {
    id: "cat_metin2_yang",
    gameId: "game_metin2",
    slug: "yang",
    name: "Yang & Won",
    productType: "CURRENCY",
    defaultDeliveryMethod: "CURRENCY_TRADE",
    platformFeeRate: 0.06, // %6
    minPrice: 20,
    maxPrice: 100000,
    isActive: true,
    createdAt: 1725700000000,
  },
  {
    id: "cat_metin2_items",
    gameId: "game_metin2",
    slug: "itemler",
    name: "Efsunlu İtemler & Zırhlar",
    productType: "ITEM",
    defaultDeliveryMethod: "MANUAL_ITEM",
    platformFeeRate: 0.06,
    minPrice: 50,
    maxPrice: 200000,
    isActive: true,
    createdAt: 1725700000000,
  },
  {
    id: "cat_valorant_vp",
    gameId: "game_valorant",
    slug: "vp",
    name: "Valorant Points (VP) E-Pin",
    productType: "DIGITAL_CODE",
    defaultDeliveryMethod: "AUTOMATIC_CODE",
    platformFeeRate: 0.03, // %3
    minPrice: 50,
    maxPrice: 10000,
    isActive: true,
    createdAt: 1725700000000,
  },
  {
    id: "cat_pubg_uc",
    gameId: "game_pubg",
    slug: "uc",
    name: "Unknown Cash (UC)",
    productType: "CURRENCY",
    defaultDeliveryMethod: "DIRECT_TRANSFER",
    platformFeeRate: 0.04, // %4
    minPrice: 30,
    maxPrice: 15000,
    isActive: true,
    createdAt: 1725700000000,
  },
  {
    id: "cat_steam_wallet",
    gameId: "game_steam",
    slug: "cuzdan-kodu",
    name: "Steam Cüzdan Kodları",
    productType: "DIGITAL_CODE",
    defaultDeliveryMethod: "AUTOMATIC_CODE",
    platformFeeRate: 0.03,
    minPrice: 20,
    maxPrice: 5000,
    isActive: true,
    createdAt: 1725700000000,
  },
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
