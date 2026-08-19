"use client";

import { useState, useEffect, use } from "react";
import { MenuItem, OrderItem, WaiterCallType, MenuLanguage } from "@/types/restaurant";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { DICTIONARY } from "@/lib/restaurant/i18n";
import MenuHeader from "@/components/restaurant/qr/MenuHeader";
import CategoryNav from "@/components/restaurant/qr/CategoryNav";
import ProductCard from "@/components/restaurant/qr/ProductCard";
import ProductModal from "@/components/restaurant/qr/ProductModal";
import CartDrawer from "@/components/restaurant/qr/CartDrawer";
import WaiterCallModal from "@/components/restaurant/qr/WaiterCallModal";
import OrderTracker from "@/components/restaurant/qr/OrderTracker";
import SplitBillModal from "@/components/restaurant/qr/SplitBillModal";
import FeedbackModal from "@/components/restaurant/qr/FeedbackModal";
import { Search, ShoppingBag, ArrowRight, ShieldCheck, AlertTriangle, Calculator, Star } from "lucide-react";

interface QrMenuPageProps {
  params: Promise<{
    restaurantSlug: string;
    tableId: string;
  }>;
}

export default function QrMenuPage({ params }: QrMenuPageProps) {
  const resolvedParams = use(params);
  const { restaurantSlug, tableId } = resolvedParams;

  const { orders, tables, menuItems, categories, createOrder, callWaiter } = useRestaurantStore();

  // Language state
  const [lang, setLang] = useState<MenuLanguage>("TR");
  const t = DICTIONARY[lang];

  // Find table or fallback
  const currentTable =
    tables.find((t) => t.id === tableId || t.tableNumber.toLowerCase() === tableId.toLowerCase()) || {
      id: tableId,
      restaurantId: DEMO_RESTAURANT.id,
      tableNumber: `Masa ${tableId.replace(/[^0-9]/g, "") || tableId}`,
      capacity: 4,
      status: "OCCUPIED" as const,
      activeBillTotal: 0,
    };

  // State
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // 15-Minute Dynamic Session Timer
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60); // 900s
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  // Filter menu items by category and search
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategoryId === "cat_popular"
        ? (item.badges && item.badges.length > 0) || item.order <= 3
        : item.categoryId === activeCategoryId;

    return matchesSearch && matchesCategory;
  });

  // Cart actions
  const handleAddToCart = (item: OrderItem) => {
    setCartItems((prev) => [...prev, item]);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    setCartItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, quantity: newQty } : it))
    );
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Order submission
  const handleSubmitOrder = async (notes: string) => {
    const totalAmount = cartItems.reduce((sum, it) => sum + it.finalPrice * it.quantity, 0);

    const newOrder = {
      id: `ord_${Date.now().toString().slice(-6)}`,
      restaurantId: DEMO_RESTAURANT.id,
      tableId: currentTable.id,
      tableNumber: currentTable.tableNumber,
      sessionToken: `sess_${Date.now()}`,
      status:
        DEMO_RESTAURANT.settings.orderMode === "DIRECT_KITCHEN"
          ? ("PREPARING" as const)
          : ("PENDING_CONFIRMATION" as const),
      items: cartItems,
      subtotal: totalAmount,
      taxAmount: Math.round(totalAmount * 0.1),
      serviceCharge: 0,
      totalAmount,
      notes: notes.trim() || undefined,
      paymentStatus: "PENDING" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    createOrder(newOrder);
    setCartItems([]);
    setIsCartOpen(false);
    setIsTrackerOpen(true);
  };

  // Waiter Call Action
  const handleSendWaiterCall = (type: WaiterCallType, message?: string) => {
    callWaiter({
      id: `call_${Date.now()}`,
      restaurantId: DEMO_RESTAURANT.id,
      tableId: currentTable.id,
      tableNumber: currentTable.tableNumber,
      type,
      message,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });
  };

  // Active table orders
  const activeTableOrders = orders.filter(
    (o) =>
      o.tableId === currentTable.id &&
      o.status !== "COMPLETED" &&
      o.status !== "CANCELLED"
  );

  const cartTotalAmount = cartItems.reduce((sum, it) => sum + it.finalPrice * it.quantity, 0);
  const cartTotalCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-foreground pb-24 select-none">
      {/* Session Expired Overlay */}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 text-center animate-fade-in">
          <div className="max-w-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Masa Oturumu Sona Erdi</h3>
            <p className="text-xs text-foreground/70 leading-relaxed">
              15 dakikalık güvenlik süreniz doldu. Sipariş vermeye devam etmek için lütfen masanızdaki QR kodu tekrar okutun.
            </p>
            <button
              onClick={() => {
                setRemainingSeconds(15 * 60);
                setSessionExpired(false);
              }}
              className="w-full py-3 rounded-xl bg-accent text-black font-bold text-xs hover:bg-accent/90 transition-colors"
            >
              Oturumu Yenile (Test)
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <MenuHeader
        restaurant={DEMO_RESTAURANT}
        table={currentTable}
        remainingMinutes={remainingMinutes}
        onOpenWaiterCall={() => setIsWaiterModalOpen(true)}
        activeOrderCount={activeTableOrders.length}
        onOpenOrderTracker={() => setIsTrackerOpen(true)}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "TR" ? "EN" : "TR"))}
        onOpenSplitBill={() => setIsSplitBillOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Quick Action Tools Bar (Split Bill & Feedback Booster) */}
      <div className="max-w-md mx-auto px-4 pt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => setIsSplitBillOpen(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[11px] font-semibold text-foreground/80 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-accent" />
          <span>{t.splitBill}</span>
        </button>

        <button
          onClick={() => setIsFeedbackOpen(true)}
          className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{lang === "TR" ? "Bizi Değerlendirin" : "Rate Us"}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto px-4 pt-3 pb-1">
        <div className="relative">
          <Search className="w-4 h-4 text-foreground/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-foreground/40 focus:outline-none focus:border-accent/60 transition-all"
          />
        </div>
      </div>

      {/* Category Navigation Bar */}
      <CategoryNav
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      {/* Product List Grid */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-foreground/40 space-y-2">
            <p className="text-sm font-medium">{lang === "TR" ? "Bu kategoride ürün bulunamadı." : "No items found in this category."}</p>
            <p className="text-xs">{lang === "TR" ? "Lütfen diğer kategorilere göz atın." : "Please check other categories."}</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
            />
          ))
        )}

        {/* Footer Branding */}
        <footer className="pt-8 pb-24 text-center space-y-1">
          <p className="text-[11px] font-bold text-foreground/50 tracking-wider">
            Powered by <span className="text-accent font-extrabold">Cep Garson</span>
          </p>
          <p className="text-[10px] text-foreground/30 font-medium">
            KvK Dijital Çözümler Restoran & POS Altyapısı
          </p>
        </footer>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-fade-in-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full p-3.5 rounded-2xl bg-accent text-black font-extrabold flex items-center justify-between shadow-2xl shadow-accent/30 hover:scale-[1.01] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center font-bold text-xs">
                {cartTotalCount}
              </div>
              <div className="text-left">
                <span className="text-xs block leading-tight">{t.viewCart}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  {cartItems.length} {t.itemsCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black">
                {cartTotalAmount.toLocaleString("tr-TR")} TL
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        restaurant={DEMO_RESTAURANT}
        tableNumber={currentTable.tableNumber}
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmitOrder={handleSubmitOrder}
        remainingMinutes={remainingMinutes}
      />

      {/* Waiter Call Modal */}
      <WaiterCallModal
        isOpen={isWaiterModalOpen}
        onClose={() => setIsWaiterModalOpen(false)}
        tableNumber={currentTable.tableNumber}
        onSendCall={handleSendWaiterCall}
      />

      {/* Order Tracker Modal */}
      <OrderTracker
        orders={activeTableOrders}
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        tableNumber={currentTable.tableNumber}
      />

      {/* Split Bill Calculator Modal */}
      <SplitBillModal
        isOpen={isSplitBillOpen}
        onClose={() => setIsSplitBillOpen(false)}
        totalAmount={currentTable.activeBillTotal || cartTotalAmount || 500}
        lang={lang}
      />

      {/* Customer Feedback & Google Review Booster Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        tableNumber={currentTable.tableNumber}
        lang={lang}
        googleReviewUrl={DEMO_RESTAURANT.settings.googleReviewUrl}
      />
    </div>
  );
}
