"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  KeyRound,
  Lock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  Check,
  X,
  Clock,
  ShieldCheck,
  Sliders,
  Percent,
} from "lucide-react";
import { StaffMember, StaffRole, StaffPermissions, BossSecuritySettings } from "@/types/restaurant";
import { useRestaurantStore } from "@/lib/restaurant/store";

const ROLE_LABELS: Record<StaffRole, { name: string; badgeColor: string; desc: string }> = {
  OWNER: { name: "Restoran Sahibi (Boss)", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40", desc: "Tüm sistem ve mali verilere tam yetkili süper yönetici." },
  MANAGER: { name: "Salon / Restoran Müdürü", badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40", desc: "Siparişler, masa transferi, şikayetler ve indirim yetkilisi." },
  CASHIER: { name: "Kasa Görevlisi", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40", desc: "Hesap kapatma, adisyon tahsilatı ve paket servis kabulü." },
  WAITER: { name: "Garson / Servis Personeli", badgeColor: "bg-accent/20 text-accent border-accent/40", desc: "Masadan sipariş alma, servis onaylama ve masa taşıma." },
  KITCHEN: { name: "Mutfak Şefi / Aşçı", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40", desc: "KDS ekranında hazırlık ve mutfak fire (zayi) kaydı." },
};

export default function StaffManager() {
  const {
    staffMembers,
    rolePermissions,
    bossSecurity,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember,
    updateRolePermissions,
    updateBossSecurity,
    restoreDemoStaff,
  } = useRestaurantStore();

  const [subTab, setSubTab] = useState<"STAFF_LIST" | "PERMISSIONS_MATRIX" | "BOSS_SECURITY">("STAFF_LIST");

  // Add staff modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>("WAITER");
  const [newStaffPin, setNewStaffPin] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");

  // Edit PIN modal
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editPin, setEditPin] = useState("");

  // Boss Security Form State
  const [masterPinInput, setMasterPinInput] = useState(bossSecurity.masterPin);
  const [is2FAEnabledInput, setIs2FAEnabledInput] = useState(bossSecurity.is2FAEnabled);
  const [twoFactorPhoneInput, setTwoFactorPhoneInput] = useState(bossSecurity.twoFactorPhone || "+90 534 891 49 05");
  const [twoFactorMethodInput, setTwoFactorMethodInput] = useState<"APP" | "SMS" | "EMAIL">(bossSecurity.twoFactorMethod || "APP");
  const [autoLockMinutesInput, setAutoLockMinutesInput] = useState(bossSecurity.autoLockMinutes || 15);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || newStaffPin.length < 4) return;

    const newStaff: StaffMember = {
      id: `staff_${Date.now()}`,
      restaurantId: "rest_aura_bistro",
      name: newStaffName.trim(),
      role: newStaffRole,
      pinCode: newStaffPin,
      phone: newStaffPhone.trim() || undefined,
      isActive: true,
      lastActiveAt: new Date().toISOString(),
    };

    addStaffMember(newStaff);
    setIsAddModalOpen(false);
    setNewStaffName("");
    setNewStaffPin("");
    setNewStaffPhone("");
  };

  const handleUpdatePin = () => {
    if (!editingStaff || editPin.length < 4) return;
    updateStaffMember(editingStaff.id, { pinCode: editPin });
    setEditingStaff(null);
    setEditPin("");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    updateBossSecurity({
      masterPin: masterPinInput,
      is2FAEnabled: is2FAEnabledInput,
      twoFactorPhone: twoFactorPhoneInput,
      twoFactorMethod: twoFactorMethodInput,
      autoLockMinutes: autoLockMinutesInput,
    });
    setSaveSuccessMsg("Patron Güvenlik ve 2FA Ayarları Başarıyla Kaydedildi!");
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sleek-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSubTab("STAFF_LIST")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === "STAFF_LIST"
                ? "bg-accent text-black shadow-lg shadow-accent/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personel Listesi ({staffMembers.length})</span>
          </button>

          <button
            onClick={() => setSubTab("PERMISSIONS_MATRIX")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === "PERMISSIONS_MATRIX"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Rol İzin Matrisi</span>
          </button>

          <button
            onClick={() => setSubTab("BOSS_SECURITY")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === "BOSS_SECURITY"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-white/5 text-foreground/70 hover:bg-white/10"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Patron Giriş & 2FA</span>
          </button>
        </div>

        {subTab === "STAFF_LIST" && (
          <div className="flex items-center gap-2 overflow-x-auto sleek-scrollbar pb-1 sm:pb-0">
            {staffMembers.length < 4 && (
              <button
                onClick={restoreDemoStaff}
                className="px-3 py-1.5 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-foreground/70 hover:text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Demo Personelleri Yükle
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-accent/90 transition-all shadow-md shadow-accent/20 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Personel</span>
            </button>
          </div>
        )}
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: STAFF LIST */}
      {subTab === "STAFF_LIST" && (
        <>
          {staffMembers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-card border border-card-border text-center space-y-4 max-w-md mx-auto my-8 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-foreground/40 mx-auto flex items-center justify-center">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">Kayıtlı Personel Bulunmuyor</h4>
                <p className="text-xs text-foreground/60 leading-relaxed">
                  Listede personel bulunmuyor. Yeni bir personel hesabı açabilir veya hazır demo personelleri tek tıkla geri yükleyebilirsiniz.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yeni Personel Ekle</span>
                </button>
                <button
                  onClick={restoreDemoStaff}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Demo Personelleri Geri Yükle</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.map((staff) => {
                const roleInfo = ROLE_LABELS[staff.role] || ROLE_LABELS.WAITER;
                return (
                  <div
                    key={staff.id}
                    className="p-5 rounded-2xl bg-card border border-card-border hover:border-accent/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-white group-hover:text-accent transition-colors">
                            {staff.name}
                          </h4>
                          {!staff.isActive && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                              Pasif
                            </span>
                          )}
                        </div>
                        <span
                          className={`inline-block mt-1.5 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${roleInfo.badgeColor}`}
                        >
                          {roleInfo.name}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center min-w-[70px]">
                        <span className="text-[9px] text-foreground/50 uppercase font-bold block">PIN KODU</span>
                        <span className="font-mono font-black text-sm text-accent tracking-widest">
                          {staff.pinCode}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-foreground/60 space-y-1 pt-2 border-t border-white/5">
                      {staff.phone && <p>Tel: {staff.phone}</p>}
                      <p className="text-[11px] text-foreground/40 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Son Giriş: {staff.lastActiveAt ? new Date(staff.lastActiveAt).toLocaleTimeString("tr-TR") : "Bugün"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <button
                        onClick={() => {
                          setEditingStaff(staff);
                          setEditPin(staff.pinCode);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-foreground/80 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-accent" />
                        <span>PIN Değiştir</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStaffMember(staff.id, { isActive: !staff.isActive })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            staff.isActive
                              ? "bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                        >
                          {staff.isActive ? "Pasife Al" : "Aktif Et"}
                        </button>

                        <button
                          onClick={() => deleteStaffMember(staff.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-foreground/40 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Personeli Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* SUB-TAB 2: ROLE PERMISSION MATRIX */}
      {subTab === "PERMISSIONS_MATRIX" && (
        <div className="p-6 rounded-3xl bg-card border border-card-border space-y-6 shadow-2xl overflow-x-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Rol Bazlı Yetkilendirme Matrisi
              </h3>
              <p className="text-xs text-foreground/60 leading-relaxed pt-0.5">
                Garson, Kasiyer, Mutfak Şefi ve Salon Müdürünün POS ekranında yapabileceği işlemleri buradan canlı olarak kısıtlayabilir veya yetkilendirebilirsiniz.
              </p>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-white/10 text-foreground/50 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">İşlem & Yetki Tanımı</th>
                <th className="py-3 px-3 text-center">Garson</th>
                <th className="py-3 px-3 text-center">Kasiyer</th>
                <th className="py-3 px-3 text-center">Mutfak Şefi</th>
                <th className="py-3 px-3 text-center">Salon Müdürü</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-foreground/80">
              {/* 1. Sipariş Onaylama */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Masadan Gelen Siparişleri Onaylama / Mutfağa İletme
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canConfirmOrders: !rolePermissions[r].canConfirmOrders })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canConfirmOrders
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canConfirmOrders ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 2. İndirim / İkram Uygulama */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Masaya İkram / İndirim Uygulama Yetkisi
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canGiveDiscount: !rolePermissions[r].canGiveDiscount })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canGiveDiscount
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canGiveDiscount ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 3. Masa Taşıma & Birleştirme */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Masa Taşıma ve Adisyon Birleştirme
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canTransferTables: !rolePermissions[r].canTransferTables })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canTransferTables
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canTransferTables ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 4. Adisyon İptal Etme (Patron Onaysız) */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Açık Adisyonu İptal Etme (Patron Onayı İstemeden)
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canCancelBill: !rolePermissions[r].canCancelBill })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canCancelBill
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      }`}
                    >
                      {rolePermissions[r].canCancelBill ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 5. Z-Raporu & Canlı Ciro Görme */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Z-Raporu Yazdırma ve Canlı Gün Sonu Cirosunu Görme
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canViewReportsAndZ: !rolePermissions[r].canViewReportsAndZ })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canViewReportsAndZ
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canViewReportsAndZ ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 6. Menü & Fiyat Değiştirme */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Ürün Fiyatlarını Değiştirme & Kampanya Başlatma
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canEditMenuAndPrices: !rolePermissions[r].canEditMenuAndPrices })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canEditMenuAndPrices
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canEditMenuAndPrices ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 7. Korumalı Şikayet Günlüğü İnceleme */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Müdüre Şikayet Kayıtlarını ve Küfür Filtreli Günlüğü İnceleme
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canViewComplaints: !rolePermissions[r].canViewComplaints })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canViewComplaints
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canViewComplaints ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>

              {/* 8. Reçete & Stok Maliyetlerini Görme */}
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-semibold text-white">
                  Gramaj Reçeteleri, Alış Fiyatları ve Kâr Marjlarını Görme
                </td>
                {(["WAITER", "CASHIER", "KITCHEN", "MANAGER"] as StaffRole[]).map((r) => (
                  <td key={r} className="py-3 px-3 text-center">
                    <button
                      onClick={() =>
                        updateRolePermissions(r, { canViewRecipesAndCosts: !rolePermissions[r].canViewRecipesAndCosts })
                      }
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                        rolePermissions[r].canViewRecipesAndCosts
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/5 text-foreground/30 border border-white/10"
                      }`}
                    >
                      {rolePermissions[r].canViewRecipesAndCosts ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-TAB 3: BOSS SECURITY & 2FA CONFIGURATION */}
      {subTab === "BOSS_SECURITY" && (
        <form onSubmit={handleSaveSecurity} className="p-8 rounded-3xl bg-card border border-card-border space-y-6 shadow-2xl max-w-2xl">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Lock className="w-6 h-6 text-purple-400" />
              Patron Yönetici Güvenliği & 2FA Yapılandırması
            </h3>
            <p className="text-xs text-foreground/60 leading-relaxed pt-1">
              Boss paneline erişim için Master PIN kodunuzu değiştirebilir, Google Authenticator veya SMS ile İki Aşamalı Doğrulamayı (2FA) aktif edebilirsiniz.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Master PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider block">
                Patron Master PIN Kodu
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={8}
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="1923"
                  className="w-full h-12 bg-black/60 border border-white/10 focus:border-purple-400 rounded-xl px-4 font-mono font-bold text-white text-base outline-none transition-all"
                />
                <KeyRound className="w-4 h-4 text-foreground/40 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-foreground/50">
                Boss paneline girerken sorulacak ana yönetici şifresidir.
              </p>
            </div>

            {/* 2FA Toggle Switch */}
            <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-extrabold text-white">İki Aşamalı Doğrulama (2FA)</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 uppercase">
                    Önerilen
                  </span>
                </div>
                <p className="text-xs text-foreground/70 leading-relaxed">
                  Aktif edildiğinde Master PIN girildikten sonra telefonunuza gelen 6 haneli güvenlik kodu istenir.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={is2FAEnabledInput}
                  onChange={(e) => setIs2FAEnabledInput(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* 2FA Method & Phone */}
            {is2FAEnabledInput && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 block">Doğrulama Yöntemi</label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(
                      [
                        { id: "APP", label: "Authenticator Uygulaması" },
                        { id: "SMS", label: "SMS Güvenlik Kodu" },
                        { id: "EMAIL", label: "E-Posta Onayı" },
                      ] as const
                    ).map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setTwoFactorMethodInput(m.id)}
                        className={`p-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                          twoFactorMethodInput === m.id
                            ? "bg-purple-500/20 border-purple-500 text-purple-300"
                            : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground/80 block">Doğrulama Telefon Numarası</label>
                  <input
                    type="text"
                    value={twoFactorPhoneInput}
                    onChange={(e) => setTwoFactorPhoneInput(e.target.value)}
                    placeholder="+90 534 891 49 05"
                    className="w-full h-11 bg-black/60 border border-white/10 focus:border-purple-400 rounded-xl px-4 text-xs font-semibold text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Auto Lock Timeout */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider block">
                Otomatik Ekran Kilitleme Süresi
              </label>
              <select
                value={autoLockMinutesInput}
                onChange={(e) => setAutoLockMinutesInput(Number(e.target.value))}
                className="w-full h-12 bg-black/60 border border-white/10 focus:border-purple-400 rounded-xl px-4 text-xs font-bold text-white outline-none"
              >
                <option value={15}>15 Dakika İşlemsizlik Sonrası Kilitle</option>
                <option value={30}>30 Dakika İşlemsizlik Sonrası Kilitle</option>
                <option value={60}>1 Saat İşlemsizlik Sonrası Kilitle</option>
                <option value={0}>Ekranı Asla Otomatik Kilitleme</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Güvenlik Ayarlarını Kaydet</span>
            </button>
          </div>
        </form>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="max-w-md w-full bg-[#0a0f0f] border border-accent/40 rounded-[2rem] p-6 space-y-5 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Yeni Personel Hesabı Tanımla
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-foreground/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70">Personel Adı Soyadı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Caner Garson"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full h-11 bg-black/60 border border-white/10 focus:border-accent rounded-xl px-4 text-xs font-semibold text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70">Görevi / Rolü</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                  className="w-full h-11 bg-black/60 border border-white/10 focus:border-accent rounded-xl px-4 text-xs font-bold text-white outline-none"
                >
                  <option value="WAITER">Garson / Servis Elemanı</option>
                  <option value="CASHIER">Kasa Görevlisi</option>
                  <option value="KITCHEN">Mutfak Şefi / Aşçı</option>
                  <option value="MANAGER">Salon / Restoran Müdürü</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70">4 Haneli Giriş PIN Kodu</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Örn: 5566"
                  value={newStaffPin}
                  onChange={(e) => setNewStaffPin(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full h-11 bg-black/60 border border-white/10 focus:border-accent rounded-xl px-4 font-mono font-bold text-center text-base tracking-widest text-accent outline-none"
                />
                <p className="text-[10px] text-foreground/40">Personel kasada hızlı oturum açarken bu PIN kodunu kullanacaktır.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground/70">Telefon Numarası (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="+90 5XX XXX XX XX"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full h-11 bg-black/60 border border-white/10 focus:border-accent rounded-xl px-4 text-xs font-semibold text-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-accent/20 transition-all cursor-pointer"
                >
                  Personeli Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit PIN Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="max-w-xs w-full bg-[#0a0f0f] border border-accent/40 rounded-[2rem] p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent border border-accent/40 mx-auto flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white">PIN Kodu Güncelle</h3>
              <p className="text-xs text-foreground/60">{editingStaff.name}</p>
            </div>

            <input
              type="text"
              maxLength={4}
              autoFocus
              value={editPin}
              onChange={(e) => setEditPin(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="••••"
              className="w-full h-12 bg-black/60 border border-accent/40 focus:border-accent rounded-xl px-4 text-center font-mono font-black text-xl tracking-[0.4em] text-accent outline-none"
            />

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-foreground/70"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleUpdatePin}
                className="flex-1 py-2.5 rounded-xl bg-accent text-black font-extrabold text-xs uppercase tracking-wider"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
