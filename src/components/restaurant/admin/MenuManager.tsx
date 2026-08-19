import { useState } from "react";
import { MenuItem, Category } from "@/types/restaurant";
import DiscountCampaignModal from "./DiscountCampaignModal";
import { Plus, Edit2, Check, X, AlertCircle, Sparkles, Image as ImageIcon, Flame, Tag, Clock } from "lucide-react";

interface MenuManagerProps {
  categories: Category[];
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
  onUpdatePrice?: (itemId: string, newPrice: number) => void;
  onSetCampaignDiscount?: (itemId: string, discountedPrice: number, discountUntil: string) => void;
  onCancelCampaignDiscount?: (itemId: string) => void;
}

export default function MenuManager({
  categories,
  menuItems,
  onToggleAvailability,
  onUpdatePrice,
  onSetCampaignDiscount,
  onCancelCampaignDiscount,
}: MenuManagerProps) {
  const [selectedCatId, setSelectedCatId] = useState<string>("ALL");
  const [editingPriceItemId, setEditingPriceItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>("");
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);

  // Discount campaign modal state
  const [campaignModalItem, setCampaignModalItem] = useState<MenuItem | null>(null);
  const [proposedPrice, setProposedPrice] = useState<number>(0);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  const filteredItems =
    selectedCatId === "ALL"
      ? menuItems
      : menuItems.filter((i) => i.categoryId === selectedCatId);

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingPriceItemId(item.id);
    setTempPrice(item.price.toString());
  };

  const handleSavePrice = (item: MenuItem) => {
    const num = parseFloat(tempPrice);
    if (!isNaN(num) && num >= 0) {
      // If new price is lower than current price, ask if this is a promotional discount
      if (num < item.price) {
        setCampaignModalItem(item);
        setProposedPrice(num);
        setIsCampaignModalOpen(true);
      } else if (onUpdatePrice) {
        onUpdatePrice(item.id, num);
        setSavedFeedbackId(item.id);
        setTimeout(() => setSavedFeedbackId(null), 1500);
      }
    }
    setEditingPriceItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCatId("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCatId === "ALL"
                ? "bg-accent text-black shadow-md shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            Tüm Ürünler ({menuItems.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCatId === cat.id
                  ? "bg-accent text-black shadow-md shadow-accent/20"
                  : "bg-white/5 text-foreground/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Item Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const categoryName = categories.find((c) => c.id === item.categoryId)?.name || "";
          const isEditingPrice = editingPriceItemId === item.id;
          const isSavedFeedback = savedFeedbackId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                item.isAvailable
                  ? "bg-[#0d1414] border-white/10 hover:border-accent/30"
                  : "bg-black/60 border-red-500/20 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0 relative">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-full object-cover ${!item.isAvailable ? "grayscale" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground/30">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[9px] font-black text-red-300 uppercase">
                      Tükendi
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-accent font-semibold block">{categoryName}</span>
                  <h4 className="text-sm font-bold text-white leading-snug line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-foreground/50 line-clamp-2 mt-0.5">{item.description}</p>

                  {/* Boss / Admin Ingredients Overview */}
                  {item.ingredients && item.ingredients.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[9px] text-foreground/40 font-bold uppercase mr-1 self-center">
                        İçerik:
                      </span>
                      {item.ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-foreground/70"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions & Live Price Editor + Live Stock Toggle */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                {/* Live Editable Price */}
                {isEditingPrice ? (
                  <div className="flex items-center gap-1.5 bg-black/80 border border-accent rounded-xl p-1 animate-fade-in">
                    <input
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSavePrice(item);
                        if (e.key === "Escape") setEditingPriceItemId(null);
                      }}
                      className="w-16 bg-transparent text-white font-extrabold text-xs px-1.5 py-0.5 focus:outline-none"
                      autoFocus
                    />
                    <span className="text-[10px] text-accent font-bold">TL</span>
                    <button
                      onClick={() => handleSavePrice(item)}
                      className="w-6 h-6 rounded-lg bg-accent text-black flex items-center justify-center hover:bg-accent/90 cursor-pointer"
                      title="Kaydet"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                    <button
                      onClick={() => setEditingPriceItemId(null)}
                      className="w-6 h-6 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                      title="İptal"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      onClick={() => handleStartEditPrice(item)}
                      className="group/price flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-accent/15 border border-white/5 hover:border-accent/40 transition-all cursor-pointer"
                      title="Fiyatı güncellemek veya indirim yapmak için tıklayın"
                    >
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="line-through text-xs text-foreground/40 font-bold">
                            {item.originalPrice} TL
                          </span>
                          <span className="text-sm font-black text-green-400">
                            {item.price} TL
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 font-bold border border-green-500/30">
                            İndirimde
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-black text-white group-hover/price:text-accent transition-colors">
                          {item.price} TL
                        </span>
                      )}
                      <Edit2 className="w-3 h-3 text-foreground/40 group-hover/price:text-accent transition-colors" />
                      {isSavedFeedback && (
                        <span className="text-[10px] text-green-400 font-bold ml-1 animate-fade-in">
                          ✓ Güncellendi
                        </span>
                      )}
                    </div>

                    {/* Cancel Campaign Button if active */}
                    {item.originalPrice && item.originalPrice > item.price && onCancelCampaignDiscount && (
                      <button
                        onClick={() => onCancelCampaignDiscount(item.id)}
                        className="text-[10px] text-red-400 hover:text-red-300 underline font-semibold cursor-pointer"
                        title="İndirimi sonlandır ve eski fiyata dön"
                      >
                        İndirimi Bitir
                      </button>
                    )}
                  </div>
                )}

                {/* Stock Toggle Button with Dynamic Hover State */}
                <button
                  onClick={() => onToggleAvailability(item.id)}
                  className={`group/btn px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    item.isAvailable
                      ? "bg-green-500/15 hover:bg-red-500/20 text-green-400 hover:text-red-300 border border-green-500/30 hover:border-red-500/40"
                      : "bg-red-500/20 hover:bg-green-500/20 text-red-300 hover:text-green-300 border border-red-500/40 hover:border-green-500/40"
                  }`}
                  title={item.isAvailable ? "Tükendi olarak işaretlemek için tıklayın" : "Tekrar satışa açmak için tıklayın"}
                >
                  {item.isAvailable ? (
                    <>
                      <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                      <X className="w-3.5 h-3.5 hidden group-hover/btn:inline-block text-red-400" />
                      <span className="group-hover/btn:hidden">Satışta</span>
                      <span className="hidden group-hover/btn:inline text-red-300">Tükendi Olarak İşaretle</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 group-hover/btn:hidden" />
                      <Check className="w-3.5 h-3.5 hidden group-hover/btn:inline-block text-green-400" />
                      <span className="group-hover/btn:hidden">Tükendi</span>
                      <span className="hidden group-hover/btn:inline text-green-300">Satışa Aç</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount Campaign Modal */}
      <DiscountCampaignModal
        isOpen={isCampaignModalOpen}
        item={campaignModalItem}
        proposedPrice={proposedPrice}
        onClose={() => setIsCampaignModalOpen(false)}
        onConfirmPermanentPrice={(itemId, price) => {
          if (onUpdatePrice) onUpdatePrice(itemId, price);
          setSavedFeedbackId(itemId);
          setTimeout(() => setSavedFeedbackId(null), 1500);
        }}
        onConfirmCampaignDiscount={(itemId, discountedPrice, expiryIso) => {
          if (onSetCampaignDiscount) {
            onSetCampaignDiscount(itemId, discountedPrice, expiryIso);
            setSavedFeedbackId(itemId);
            setTimeout(() => setSavedFeedbackId(null), 1500);
          }
        }}
      />
    </div>
  );
}
