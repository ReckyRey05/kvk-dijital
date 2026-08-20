"use client";

import { useState, useEffect, use } from "react";
import { MenuItem, OrderItem, WaiterCallType, MenuLanguage, MenuCurrency, TableParticipant } from "@/types/restaurant";
import { DEMO_RESTAURANT } from "@/lib/restaurant/mockData";
import { useRestaurantStore } from "@/lib/restaurant/store";
import { DICTIONARY } from "@/lib/restaurant/i18n";
import { formatPrice } from "@/lib/restaurant/currency";
import MenuHeader from "@/components/restaurant/qr/MenuHeader";
import CategoryNav from "@/components/restaurant/qr/CategoryNav";
import ProductCard from "@/components/restaurant/qr/ProductCard";
import ProductModal from "@/components/restaurant/qr/ProductModal";
import CartDrawer from "@/components/restaurant/qr/CartDrawer";
import WaiterCallModal from "@/components/restaurant/qr/WaiterCallModal";
import OrderTracker from "@/components/restaurant/qr/OrderTracker";
import SplitBillModal from "@/components/restaurant/qr/SplitBillModal";
import FeedbackModal from "@/components/restaurant/qr/FeedbackModal";
import OnlinePaymentModal from "@/components/restaurant/qr/OnlinePaymentModal";
import SpinWheelModal from "@/components/restaurant/qr/SpinWheelModal";
import JukeboxModal from "@/components/restaurant/qr/JukeboxModal";
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

  const {
    orders,
    tables,
    menuItems,
    categories,
    createOrder,
    callWaiter,
    payTableOnline,
    sharedCarts,
    tableParticipants,
    addToSharedCart,
    updateSharedCartQuantity,
    removeFromSharedCart,
    clearSharedCart,
    registerParticipant,
    transferHostRole,
    updateParticipantName,
  } = useRestaurantStore();

  // Language & Currency state
  const [lang, setLang] = useState<MenuLanguage>("TR");
  const [currency, setCurrency] = useState<MenuCurrency>("TRY");
  const t = DICTIONARY[lang];

  // Current table
  const currentTable =
    tables.find((t) => t.id === tableId || t.tableNumber.toLowerCase() === tableId.toLowerCase()) || {
      id: tableId,
      restaurantId: DEMO_RESTAURANT.id,
      tableNumber: `Masa ${tableId.replace(/[^0-9]/g, "") || tableId}`,
      capacity: 4,
      status: "OCCUPIED" as const,
      activeBillTotal: 0,
    };

  // Multi-user & Table Participant Setup
  const [currentParticipant, setCurrentParticipant] = useState<TableParticipant | null>(null);
  const participants = tableParticipants[tableId] || [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = `cg_participant_${tableId}`;
    const stored = localStorage.getItem(storageKey);
    let participant: TableParticipant;

    const existingList = tableParticipants[tableId] || [];

    if (stored) {
      participant = JSON.parse(stored);
      // Sync host state with store if changed
      const liveP = existingList.find((p) => p.id === participant.id);
      if (liveP) {
        participant = liveP;
      }
    } else {
      const isFirst = existingList.length === 0;
      const guestNum = existingList.length + 1;
      participant = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: isFirst ? "Masa Reisi" : `Misafir ${guestNum}`,
        isHost: isFirst,
        joinedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(participant));
    }

    const registered = registerParticipant(tableId, participant);
    setCurrentParticipant(registered);
  }, [tableId]);

  // Keep local participant in sync when host role transfers
  useEffect(() => {
    if (currentParticipant) {
      const live = participants.find((p) => p.id === currentParticipant.id);
      if (live && (live.isHost !== currentParticipant.isHost || live.name !== currentParticipant.name)) {
        setCurrentParticipant(live);
        localStorage.setItem(`cg_participant_${tableId}`, JSON.stringify(live));
      }
    }
  }, [participants, currentParticipant, tableId]);

  // Shared Cart Items
  const cartItems = sharedCarts[tableId] || [];

  // State
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isOnlinePaymentOpen, setIsOnlinePaymentOpen] = useState(false);
  const [isSpinWheelOpen, setIsSpinWheelOpen] = useState(false);
  const [isJukeboxOpen, setIsJukeboxOpen] = useState(false);

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

  // Cart actions (Shared Table Cart)
  const handleAddToCart = (item: OrderItem) => {
    const itemWithUser: OrderItem = {
      ...item,
      addedBy: currentParticipant?.name || "Misafir",
      addedById: currentParticipant?.id,
    };
    addToSharedCart(tableId, itemWithUser);
  };

  const handleUpdateQuantity = (index: number, newQty: number) => {
    updateSharedCartQuantity(tableId, index, newQty);
  };

  const handleRemoveItem = (index: number) => {
    removeFromSharedCart(tableId, index);
  };

  // Order submission by Host
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
    clearSharedCart(tableId);
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

  // Update Participant Name
  const handleUpdateName = (newName: string) => {
    if (currentParticipant) {
      updateParticipantName(tableId, currentParticipant.id, newName);
      const updated = { ...currentParticipant, name: newName };
      setCurrentParticipant(updated);
      localStorage.setItem(`cg_participant_${tableId}`, JSON.stringify(updated));
    }
  };

  // Transfer Host Role
  const handleTransferHost = (targetId: string) => {
    transferHostRole(tableId, targetId);
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
        currency={currency}
        onSelectCurrency={setCurrency}
        onOpenSplitBill={() => setIsSplitBillOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenSpinWheel={() => setIsSpinWheelOpen(true)}
        onOpenJukebox={() => setIsJukeboxOpen(true)}
        tableBillTotal={currentTable.activeBillTotal}
        currentParticipant={currentParticipant}
        participantCount={participants.length || 1}
        onUpdateName={handleUpdateName}
      />

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
              currency={currency}
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
                {formatPrice(cartTotalAmount, currency)}
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
        currency={currency}
        onOpenOnlinePayment={() => setIsOnlinePaymentOpen(true)}
        currentParticipant={currentParticipant}
        participants={participants}
        onTransferHost={handleTransferHost}
        onPayMyShare={(myItems, myTotal) => {
          setIsCartOpen(false);
          setIsOnlinePaymentOpen(true);
        }}
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

      {/* Masada Online Ödeme (3D Secure) Modal */}
      <OnlinePaymentModal
        isOpen={isOnlinePaymentOpen}
        onClose={() => setIsOnlinePaymentOpen(false)}
        tableNumber={currentTable.tableNumber}
        totalAmount={currentTable.activeBillTotal || cartTotalAmount || 450}
        currency={currency}
        onPaymentSuccess={() => {
          payTableOnline(currentTable.id);
          clearSharedCart(currentTable.id);
          setIsOnlinePaymentOpen(false);
          setIsSpinWheelOpen(true); // Reward customer with spin wheel!
        }}
      />

      {/* İkram Çarkıfeleği (Gamification Loyalty) Modal */}
      <SpinWheelModal
        isOpen={isSpinWheelOpen}
        onClose={() => setIsSpinWheelOpen(false)}
        tableNumber={currentTable.tableNumber}
      />

      {/* Dijital Jukebox (Müzik Kutusu) Modal */}
      <JukeboxModal
        isOpen={isJukeboxOpen}
        onClose={() => setIsJukeboxOpen(false)}
        tableNumber={currentTable.tableNumber}
      />
    </div>
  );
}
