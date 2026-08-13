"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Info, 
  Check, 
  Sparkles,
  Tag,
  Truck
} from "lucide-react";

interface Product {
  id: string;
  code: string;
  name: string;
  category: "Giyim" | "Takı & Aksesuar" | "Çanta" | "Ev & Yaşam";
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
  variants: string[];
  description: string;
}

interface CartItem {
  product: Product;
  selectedVariant: string;
  quantity: number;
}

const mockProducts: Product[] = [
  {
    id: "p1",
    code: "ART-101",
    name: "Dokuma Keten Omuz Çantası",
    category: "Çanta",
    price: 850,
    oldPrice: 1100,
    image: "/images/demos/artisanal-butik/bag.jpg",
    badge: "Çok Satan",
    variants: ["Doğal Bej", "Toprak Kahve", "Obsidyen Siyah"],
    description: "%100 doğal işlenmemiş keten iplikten elde dokunmuş, içi astarlı ve fermuarlı cepli dayanıklı gündelik omuz çantası."
  },
  {
    id: "p2",
    code: "ART-102",
    name: "El Yapımı Seramik Kahve Fincan Seti",
    category: "Ev & Yaşam",
    price: 420,
    image: "/images/demos/artisanal-butik/ceramic.jpg",
    badge: "Yeni",
    variants: ["Kireç Beyazı", "Koyu Zeytin", "Toprak Taba"],
    description: "Tornada tek tek biçimlendirilmiş, gıda ile temasa uygun doğal sırlı ikili el yapımı seramik espresso fincan seti."
  },
  {
    id: "p3",
    code: "ART-103",
    name: "Doğal Taş & Pirinç Madalyon Kolye",
    category: "Takı & Aksesuar",
    price: 590,
    oldPrice: 750,
    image: "/images/demos/artisanal-butik/necklace.jpg",
    badge: "İndirim",
    variants: ["Altın Kaplama", "Gümüş Tonu"],
    description: "Aventurin ve akik doğal taşları ile pirinç madalyon detaylı, kararmaya dayanıklı el yapımı tasarım kolye."
  },
  {
    id: "p4",
    code: "ART-104",
    name: "Oversize Keten Yazlık Gömlek",
    category: "Giyim",
    price: 1250,
    image: "/images/demos/artisanal-butik/shirt.jpg",
    badge: "Koleksiyon",
    variants: ["S", "M", "L", "XL"],
    description: "Ferah ve nefes alan saf keten kumaştan rahat kesim, sedef düğmeli uniseks yazlık gömlek."
  },
  {
    id: "p5",
    code: "ART-105",
    name: "El İşçiliği Hakiki Deri Kartlık",
    category: "Takı & Aksesuar",
    price: 340,
    image: "/images/demos/artisanal-butik/wallet.jpg",
    variants: ["Taba Deri", "Füme Deri"],
    description: "Vejetal dana derisinden mumlu iplikle elde dikilmiş 6 kart kapasiteli minimalist deri cüzdan."
  },
  {
    id: "p6",
    code: "ART-106",
    name: "Minimalist Pirinç Kelepçe Bileklik",
    category: "Takı & Aksesuar",
    price: 480,
    image: "/images/demos/artisanal-butik/bracelet.jpg",
    variants: ["Mat Altın", "Parlak Bronz"],
    description: "Ayarlanabilir formda dövme pirinç malzeme üzerine mat cila kaplamalı zarif kelepçe bileklik."
  },
  {
    id: "p7",
    code: "ART-107",
    name: "Geniş Hacimli Kanvas Tote Bag",
    category: "Çanta",
    price: 680,
    oldPrice: 850,
    image: "/images/demos/artisanal-butik/tote.jpg",
    badge: "İndirim",
    variants: ["Krem Kanvas", "Haki Yeşil"],
    description: "Ağır gramajlı organik pamuk kanvas kumaştan, laptop ve günlük eşyalar için ideal tote bag."
  },
  {
    id: "p8",
    code: "ART-108",
    name: "Atölye Üretimi Seramik Vazo",
    category: "Ev & Yaşam",
    price: 790,
    image: "/images/demos/artisanal-butik/hero.jpg",
    badge: "Özel Tasarım",
    variants: ["Mat Beyaz", "Kum Beji"],
    description: "İç mekan dekorasyonuna derinlik katan, dokulu yüzey sırlı el yapımı seramik dekoratif vazo."
  }
];

export default function DemoButikClient() {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [sortBy, setSortBy] = useState<string>("recommended");
  
  // Interactive E-Commerce States
  const [favorites, setFavorites] = useState<string[]>(["p1", "p3"]);
  const [cart, setCart] = useState<CartItem[]>([
    { product: mockProducts[0], selectedVariant: "Doğal Bej", quantity: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [modalVariant, setModalVariant] = useState<string>("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = mockProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "Tümü" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  // Cart Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const cartTotalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Actions
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addToCart = (product: Product, variant: string) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedVariant === variant);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { product, selectedVariant: variant, quantity: 1 }];
    });
    setToastMsg(`"${product.name}" sepete eklendi.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const triggerCheckoutDemo = () => {
    setIsCartOpen(false);
    setToastMsg("Bu bir e-ticaret konsept demo çalışmasıdır. Gerçek mağazanız için iyzico, PayTR veya Stripe ödeme altyapısı ve kargo entegrasyonu kurulur.");
    setTimeout(() => setToastMsg(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1f1c19] flex flex-col font-sans selection:bg-[#c27a58]/30 selection:text-white">
      
      {/* 1. TOP ANNOUNCEMENT UTILITY STRIP */}
      <div className="w-full bg-[#1f1c19] text-[#faf8f5] py-2 px-4 text-center text-xs flex items-center justify-between gap-4 relative z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[#c27a58]" />
            <span className="text-[11px]">✨ 500 ₺ Üzeri Siparişlerde <strong>Ücretsiz Kargo</strong> & Hızlı Teslimat</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/" className="font-semibold text-[#c27a58] hover:text-white transition-colors">
              ← Ana KvK Sitesine Dön
            </Link>
          </div>
        </div>
      </div>

      {/* Fixed Floating Bottom Right Demo Badge */}
      <div className="fixed bottom-6 right-6 z-50 hidden sm:flex items-center gap-3 p-3 rounded-full bg-[#1f1c19]/95 border border-[#c27a58]/60 text-white text-xs shadow-2xl backdrop-blur-md">
        <Info className="w-4 h-4 text-[#c27a58] shrink-0" />
        <span className="text-[11px] text-[#e8ded1]">Konsept E-Ticaret — <strong>KvK Dijital</strong></span>
        <Link href="/#iletisim" className="px-3 py-1 rounded bg-[#c27a58] text-white font-bold text-[10px] uppercase tracking-wider hover:bg-[#d88b68] transition-colors">
          Teklif Al
        </Link>
      </div>

      {/* 2. COMMERCE-FIRST MAIN HEADER */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#e8e2d8]">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
          
          {/* Brand Logo */}
          <Link href="/projeler/artisanal-butik-demo" className="flex flex-col shrink-0">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1f1c19]">ARTİSANAL</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#4a5342] font-semibold -mt-1">Butik & Mağaza</span>
          </Link>

          {/* Live Search Bar Input */}
          <div className="hidden md:flex flex-grow max-w-md items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı veya kategori ara (örn: çanta, kolye, keten)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0ebe1] border border-[#e0d6c8] rounded-full text-xs text-[#1f1c19] placeholder-[#8c8275] focus:outline-none focus:border-[#c27a58] transition-colors"
            />
            <Search className="w-4 h-4 text-[#8c8275] absolute left-3.5" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 text-[#8c8275] hover:text-[#1f1c19]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Header Action Icons (Favorites & Cart Drawer) */}
          <div className="flex items-center gap-4 shrink-0">
            
            {/* Favorites Icon */}
            <div className="relative flex items-center gap-1.5 cursor-pointer text-[#1f1c19] hover:text-[#c27a58] transition-colors">
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-medium">Favoriler</span>
              {favorites.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#c27a58] text-white text-[10px] font-bold flex items-center justify-center -mt-3 -ml-1">
                  {favorites.length}
                </span>
              )}
            </div>

            {/* Cart Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f1c19] text-[#faf8f5] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#38332d] transition-all cursor-pointer shadow-lg shadow-[#1f1c19]/10"
            >
              <ShoppingBag className="w-4 h-4 text-[#c27a58]" />
              <span className="hidden sm:inline">Sepet</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#c27a58] text-white text-[10px] font-bold">
                {cartTotalItems}
              </span>
            </button>

          </div>

        </div>

        {/* 3. SUB-NAVIGATION CATEGORY PILLS BAR */}
        <div className="border-t border-[#e8e2d8]/60 bg-[#f4efe6] py-2.5 px-6">
          <div className="container mx-auto flex items-center justify-between overflow-x-auto text-xs gap-6">
            <div className="flex items-center gap-2">
              {["Tümü", "Giyim", "Takı & Aksesuar", "Çanta", "Ev & Yaşam"].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-[#1f1c19] text-[#faf8f5] shadow-sm"
                      : "bg-[#e8dfd1]/60 text-[#635d55] hover:bg-[#e8dfd1] hover:text-[#1f1c19]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-[#8c8275]">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[11px] font-semibold text-[#1f1c19] focus:outline-none cursor-pointer"
              >
                <option value="recommended">Önerilen</option>
                <option value="price-low">Fiyat: Düşükten Yüksek</option>
                <option value="price-high">Fiyat: Yüksekten Düşük</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 bg-[#1f1c19] border border-[#c27a58] text-[#faf8f5] text-xs leading-relaxed shadow-2xl flex items-start gap-3 rounded-lg">
          <Check className="w-5 h-5 text-[#c27a58] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#c27a58] mb-0.5">E-Ticaret Bildirimi</p>
            <p>{toastMsg}</p>
          </div>
        </div>
      )}

      {/* 4. BOUTIQUE HERO COLLECTION BANNER */}
      <section className="py-12 md:py-16 border-b border-[#e8e2d8] bg-[#f2ebd9]/40">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8dfd1] text-[#4a5342] text-[11px] tracking-widest uppercase font-semibold rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#c27a58]" />
                2026 Yaz Butik Koleksiyonu
              </span>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1f1c19] leading-tight">
                El İşçiliğinin Modern Yorumu & <br />
                <em className="italic font-serif text-[#c27a58] font-normal">Zamansız Tasarımlar.</em>
              </h1>

              <p className="text-sm text-[#635d55] max-w-xl font-light leading-relaxed">
                Doğal kumaşlar, elde şekillendirilmiş seramikler ve özgün aksesuar koleksiyonlarımızı keşfedin.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <a 
                  href="#products" 
                  className="px-6 py-3 bg-[#1f1c19] text-[#faf8f5] font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#38332d] transition-all inline-flex items-center gap-2"
                >
                  Koleksiyonu İncele <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="h-[320px] rounded-2xl overflow-hidden border border-[#e0d6c8] shadow-xl relative bg-[#e8dfd1]">
                <img 
                  src="/images/demos/artisanal-butik/hero.jpg" 
                  alt="Artisanal Butik el yapımı tasarım ürünler koleksiyonu"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width={800}
                  height={500}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE PRODUCT GRID */}
      <section id="products" className="py-16 border-b border-[#e8e2d8]">
        <div className="container mx-auto px-6 max-w-7xl space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e8e2d8] pb-6">
            <div>
              <span className="text-[#c27a58] text-xs font-semibold tracking-widest uppercase block mb-1">Mağaza Kataloğu</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1f1c19]">Öne Çıkan Ürünler</h2>
            </div>
            <div className="text-xs text-[#8c8275] font-mono">
              Listelenen: <strong className="text-[#1f1c19]">{filteredProducts.length} Demo Ürün</strong>
            </div>
          </div>

          {/* Zero State Handling */}
          {filteredProducts.length === 0 ? (
            <div className="p-16 border border-[#e0d6c8] bg-[#f4efe6] text-center space-y-4 max-w-md mx-auto rounded-2xl">
              <Search className="w-8 h-8 text-[#c27a58] mx-auto opacity-60" />
              <h3 className="font-serif text-lg text-[#1f1c19]">Aramanıza Uygun Ürün Bulunamadı</h3>
              <p className="text-xs text-[#8c8275]">Lütfen arama teriminizi veya kategori filtrenizi değiştirerek tekrar deneyiniz.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setSelectedCategory("Tümü"); }}
                className="px-5 py-2 bg-[#1f1c19] text-[#faf8f5] font-bold text-xs uppercase tracking-wider rounded-full"
              >
                Tüm Ürünleri Göster
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const isFav = favorites.includes(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => { setSelectedProductModal(product); setModalVariant(product.variants[0]); }}
                    className="group bg-white border border-[#e8e2d8] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#c27a58]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative h-64 overflow-hidden bg-[#f4efe6]">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        width={600}
                        height={600}
                      />
                      
                      {/* Product Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                        {product.badge && (
                          <span className="px-2.5 py-0.5 bg-[#1f1c19] text-[#faf8f5] text-[9px] font-bold uppercase tracking-wider rounded-full">
                            {product.badge}
                          </span>
                        )}
                        {product.oldPrice && (
                          <span className="px-2.5 py-0.5 bg-[#c27a58] text-white text-[9px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" /> İndirim
                          </span>
                        )}
                      </div>

                      {/* Favorite Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(product.id, e)}
                        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isFav ? "bg-[#c27a58] text-white" : "bg-white/80 text-[#1f1c19] hover:bg-white"
                        }`}
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>

                    <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] tracking-widest uppercase font-semibold text-[#4a5342] block">{product.category}</span>
                        <h3 className="font-serif text-base font-semibold text-[#1f1c19] group-hover:text-[#c27a58] transition-colors leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="pt-3 border-t border-[#f0ebe1] flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif text-lg font-bold text-[#1f1c19]">{product.price} ₺</span>
                          {product.oldPrice && (
                            <span className="text-xs text-[#8c8275] line-through font-mono">{product.oldPrice} ₺</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); addToCart(product, product.variants[0]); }}
                          className="p-2 rounded-full bg-[#f4efe6] text-[#1f1c19] hover:bg-[#1f1c19] hover:text-white transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 6. INTERACTIVE PRODUCT DETAIL MODAL */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
          <div className="bg-white border border-[#e8e2d8] max-w-2xl w-full p-6 sm:p-8 relative text-[#1f1c19] space-y-6 rounded-2xl shadow-2xl my-8">
            
            <button 
              type="button"
              onClick={() => setSelectedProductModal(null)}
              className="absolute top-4 right-4 p-2 text-[#8c8275] hover:text-[#1f1c19] bg-[#f4efe6] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="h-72 w-full bg-[#f4efe6] rounded-xl overflow-hidden border border-[#e0d6c8]">
                <img src={selectedProductModal.image} alt={selectedProductModal.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-[#4a5342]">{selectedProductModal.category}</span>
                  <h2 className="font-serif text-xl font-bold text-[#1f1c19] leading-snug">{selectedProductModal.name}</h2>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-2xl font-bold text-[#c27a58]">{selectedProductModal.price} ₺</span>
                    {selectedProductModal.oldPrice && (
                      <span className="text-sm text-[#8c8275] line-through font-mono">{selectedProductModal.oldPrice} ₺</span>
                    )}
                  </div>
                  <p className="text-xs text-[#635d55] leading-relaxed pt-2">{selectedProductModal.description}</p>
                </div>

                {/* Variant Selector */}
                <div className="space-y-2 pt-2 border-t border-[#f0ebe1]">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1f1c19]">Varyant Seçiniz:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProductModal.variants.map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setModalVariant(v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          modalVariant === v
                            ? "bg-[#1f1c19] text-white font-bold"
                            : "bg-[#f4efe6] text-[#635d55] hover:bg-[#e8dfd1]"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => { addToCart(selectedProductModal, modalVariant); setSelectedProductModal(null); }}
                    className="w-full py-3 bg-[#1f1c19] text-[#faf8f5] font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#38332d] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#c27a58]" /> Sepete Ekle
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* 7. SLIDE-OVER CART DRAWER (SEPET PANELİ) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl relative">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e8e2d8] pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#c27a58]" />
                  <h2 className="font-serif text-lg font-bold text-[#1f1c19]">Alışveriş Sepeti</h2>
                  <span className="text-xs font-mono text-[#8c8275]">({cartTotalItems} ürün)</span>
                </div>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-[#8c8275] hover:text-[#1f1c19] rounded-full hover:bg-[#f4efe6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#8c8275] mx-auto opacity-40" />
                  <p className="text-xs text-[#8c8275]">Sepetiniz henüz boş.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-[#f4efe6] rounded-xl border border-[#e0d6c8] items-center justify-between">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
                      
                      <div className="flex-grow space-y-1">
                        <h3 className="font-serif text-xs font-bold text-[#1f1c19] line-clamp-1">{item.product.name}</h3>
                        <span className="text-[10px] font-mono text-[#635d55] block">Seçim: {item.selectedVariant}</span>
                        <span className="font-serif text-xs font-bold text-[#c27a58]">{item.product.price * item.quantity} ₺</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-[#e0d6c8] rounded-lg bg-white">
                          <button onClick={() => updateCartQuantity(index, -1)} className="p-1 text-[#1f1c19] hover:bg-[#f4efe6]">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(index, 1)} className="p-1 text-[#1f1c19] hover:bg-[#f4efe6]">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeCartItem(index)} className="p-1 text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-[#e8e2d8] pt-6 space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#635d55]">
                    <span>Ara Toplam</span>
                    <span className="font-mono">{cartSubtotal} ₺</span>
                  </div>
                  <div className="flex justify-between text-[#635d55]">
                    <span>Kargo</span>
                    <span className="font-mono text-emerald-700 font-semibold">{cartSubtotal >= 500 ? "ÜCRETSİZ" : "49 ₺"}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#1f1c19] pt-2 border-t border-[#e8e2d8]">
                    <span>Toplam Tutarı</span>
                    <span className="font-serif text-lg text-[#c27a58]">{cartSubtotal >= 500 ? cartSubtotal : cartSubtotal + 49} ₺</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={triggerCheckoutDemo}
                  className="w-full py-4 bg-[#1f1c19] text-[#faf8f5] font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#38332d] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl shadow-[#1f1c19]/20"
                >
                  Demo Siparişi Onayla <ArrowRight className="w-4 h-4 text-[#c27a58]" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 8. FOOTER & KVK CONVERSION */}
      <footer className="py-16 bg-[#1f1c19] text-center space-y-6 text-[#faf8f5]">
        <div className="container mx-auto px-6 max-w-3xl space-y-6">
          <h2 className="font-serif text-3xl font-bold text-[#faf8f5]">
            Butik Mağazanız Veya Moda Markanız İçin E-Ticaret Web Sitesi İster Misiniz?
          </h2>
          <p className="text-xs text-[#a69d92] max-w-xl mx-auto leading-relaxed">
            Bu sayfa <strong>KvK Dijital Çözümler</strong> ajansı tarafından e-ticaret markalarına özel filtrelenebilir ürün kataloğu ve sepet modülünü sergilemek amacıyla hazırlanmıştır. Gerçek sipariş veya ödeme altyapısı barındırmaz.
          </p>
          <div>
            <Link 
              href="/#iletisim"
              className="px-8 py-3.5 bg-[#c27a58] text-white font-bold text-xs tracking-widest uppercase rounded-full hover:bg-[#d88b68] transition-all inline-flex items-center gap-2"
            >
              KvK Dijital'den Teklif Alın <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="pt-8 border-t border-[#38332d] flex items-center justify-center gap-6 text-xs text-[#8c8275]">
            <Link href="/" className="hover:text-white transition-colors">KvK Ana Sayfa</Link>
            <Link href="/projeler" className="hover:text-white transition-colors">Tüm Örnek Projeler</Link>
            <Link href="/#iletisim" className="hover:text-white transition-colors">İletişim & Teklif</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
