"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TeklifimConversation,
  TeklifimOffer,
  TeklifimRequest,
  TeklifimMessage,
  TeklifimOfferVersion,
  TeklifimAgreement,
} from "@/types/teklifimGelsin";
import CounterOfferModal from "./CounterOfferModal";
import OfferHistoryDrawer from "./OfferHistoryDrawer";
import AgreementSummaryModal from "./AgreementSummaryModal";
import {
  Send,
  Paperclip,
  ShieldCheck,
  History,
  FileCheck,
  Check,
  CheckCheck,
  PhoneCall,
  Clock,
  ArrowRightLeft,
  FileText,
  AlertCircle,
  Download,
  Building2,
  Calendar,
  X,
  RefreshCw,
} from "lucide-react";

interface ConversationPaneProps {
  conversationId: string;
  currentUserId: string;
  onRefreshConversations?: () => void;
}

export default function ConversationPane({
  conversationId,
  currentUserId,
  onRefreshConversations,
}: ConversationPaneProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [conversation, setConversation] = useState<TeklifimConversation | null>(null);
  const [offer, setOffer] = useState<TeklifimOffer | null>(null);
  const [request, setRequest] = useState<TeklifimRequest | null>(null);
  const [agreement, setAgreement] = useState<TeklifimAgreement | null>(null);
  const [messages, setMessages] = useState<TeklifimMessage[]>([]);

  // Input states
  const [inputText, setInputText] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showCounterModal, setShowCounterModal] = useState<boolean>(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);
  const [showAgreementModal, setShowAgreementModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load conversation details & messages
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      // Fetch messages (also marks them as read)
      const [msgRes, convListRes] = await Promise.all([
        fetch(`/api/teklifim-gelsin/conversations/${conversationId}/messages`),
        fetch(`/api/teklifim-gelsin/conversations`),
      ]);

      const msgData = await msgRes.json();
      const convListData = await convListRes.json();

      if (msgData.messages) {
        setMessages(msgData.messages);
      }

      if (convListData.conversations) {
        const found = convListData.conversations.find((c: TeklifimConversation) => c.id === conversationId);
        if (found) {
          setConversation(found);

          // Fetch related request and offer
          const reqRes = await fetch(`/api/teklifim-gelsin/requests/${found.requestId}`);
          const reqData = await reqRes.json();
          if (reqData.request) setRequest(reqData.request);

          const offerRes = await fetch(`/api/teklifim-gelsin/offers/${found.offerId}`);
          const offerData = await offerRes.json();
          if (offerData.offer) setOffer(offerData.offer);
        }
      }

      // Check if agreement exists
      try {
        const agrRes = await fetch(`/api/teklifim-gelsin/agreements/agr_${conversationId.replace("conv_", "")}`);
        if (agrRes.ok) {
          const agrData = await agrRes.json();
          if (agrData.agreement) setAgreement(agrData.agreement);
        }
      } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || "Görüşme verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      loadData();
    }
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isBusiness = request?.businessId === currentUserId;
  const isSupplier = offer?.supplierId === currentUserId;
  const isOfferAccepted = offer?.status === "accepted" || offer?.status === "selected";
  const isOfferClosed = offer?.status === "rejected" || offer?.status === "expired";
  const currentVersion = offer?.version || 1;

  // Handle Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    setErrorMsg(null);

    try {
      let attachmentData: any = undefined;

      // Upload file first if selected
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await fetch("/api/teklifim-gelsin/attachments", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        setIsUploading(false);

        if (!uploadRes.ok) {
          throw new Error(uploadJson.error || "Dosya yüklenemedi.");
        }
        attachmentData = uploadJson.attachment;
      }

      const res = await fetch(`/api/teklifim-gelsin/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputText.trim(),
          type: "text",
          attachment: attachmentData,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mesaj iletilemedi.");

      setMessages((prev) => [...prev, data.message]);
      setInputText("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onRefreshConversations) onRefreshConversations();
    } catch (err: any) {
      setErrorMsg(err.message || "Mesaj gönderilirken hata oluştu.");
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  // Handle Direct Offer Acceptance
  const handleAcceptOffer = async () => {
    if (!confirm("Bu teklifi kabul edip resmi anlaşma oluşturmak istediğinize emin misiniz?")) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/teklifim-gelsin/conversations/${conversationId}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Teklif kabul edilemedi.");

      setAgreement(data.agreement);
      if (offer) setOffer({ ...offer, status: "accepted" });
      await loadData();
      setShowAgreementModal(true);
      if (onRefreshConversations) onRefreshConversations();
    } catch (err: any) {
      alert(err.message || "İşlem sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp bridge helper
  const getWhatsAppLink = () => {
    if (!offer || !request) return "#";
    const phone = isBusiness ? offer.supplierPhone : request.businessPhone;
    if (!phone) return "#";

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("90") ? cleanPhone : `90${cleanPhone}`;

    const text = encodeURIComponent(
      `Merhaba, Toptancım Cebimde üzerinden açılan "${request.title}" talebine ait teklif (#${offer.id.slice(0, 5)}) hakkında görüşmek istiyorum.`
    );
    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  if (loading && !conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-zinc-500">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400" />
        <span>Konuşma yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* 1. ANCHORED LIVE OFFER BANNER */}
      {offer && request && (
        <div className="border-b border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: Supplier / Business Profile Context */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 font-bold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                    {isBusiness ? offer.supplierName : request.businessName}
                  </h3>
                  {offer.supplierIsVerified && (
                    <span
                      title="Onaylı Kurumsal Tedarikçi"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Talep: <span className="font-medium text-zinc-700 dark:text-zinc-300">{request.title}</span> • #{offer.id.slice(0, 6)}
                </p>
              </div>
            </div>

            {/* Middle: Live Agreed Specs */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/60">
                <span className="text-zinc-400 block text-2xs uppercase">Güncel Tutar</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {offer.totalPrice.toLocaleString("tr-TR")} TL
                </span>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/60">
                <span className="text-zinc-400 block text-2xs uppercase">Teslimat</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {offer.deliveryDays} İş Günü
                </span>
              </div>

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-800 dark:bg-zinc-800/60">
                <span className="text-zinc-400 block text-2xs uppercase">Durum</span>
                <span
                  className={`font-bold ${
                    isOfferAccepted
                      ? "text-emerald-600 dark:text-emerald-400"
                      : offer.status === "countered"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isOfferAccepted
                    ? "Anlaşma Sağlandı"
                    : offer.status === "countered"
                    ? `Pazarlık (Rev. #${currentVersion})`
                    : "İlk Teklif"}
                </span>
              </div>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Counter Offer Button */}
              {!isOfferAccepted && !isOfferClosed && (
                <button
                  onClick={() => setShowCounterModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Karşı Teklif Ver
                </button>
              )}

              {/* Accept Offer Button (Business Only) */}
              {isBusiness && !isOfferAccepted && !isOfferClosed && (
                <button
                  onClick={handleAcceptOffer}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                >
                  <Check className="h-3.5 w-3.5" />
                  Bu Teklifi Kabul Et
                </button>
              )}

              {/* Agreement Contract View Button */}
              {(isOfferAccepted || agreement) && (
                <button
                  onClick={() => setShowAgreementModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800"
                >
                  <FileCheck className="h-3.5 w-3.5" />
                  Sözleşmeyi İncele
                </button>
              )}

              {/* Version History Drawer Trigger */}
              <button
                onClick={() => setShowHistoryDrawer(true)}
                title="Teklif Değişim Geçmişi"
                className="rounded-xl border border-zinc-300 p-2 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <History className="h-4 w-4" />
              </button>

              {/* Secondary Action: WhatsApp */}
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp ile İletişime Geç"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-zinc-800 dark:text-emerald-400 dark:hover:bg-zinc-700"
              >
                <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. ERROR BANNER */}
      {errorMsg && (
        <div className="m-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. MESSAGE STREAM */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Bu teklif için görüşme başlatıldı.</p>
            <p className="text-xs text-zinc-500">
              Şartları konuşabilir, dosya ekleyebilir veya karşı teklif iletebilirsiniz.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            });

            // Special: Agreement Banner Message
            if (msg.type === "agreement") {
              return (
                <div
                  key={msg.id}
                  className="mx-auto my-4 max-w-lg rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 text-center shadow-xs dark:border-emerald-800 dark:bg-emerald-950/40"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Resmi Anlaşma Kaydı Oluşturuldu
                  </h4>
                  <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">{msg.content}</p>
                  <button
                    onClick={() => setShowAgreementModal(true)}
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Sözleşme Detayını Aç
                  </button>
                </div>
              );
            }

            // Special: Counter Offer Card Message
            if (msg.type === "counter_offer" && msg.counterOfferData) {
              const cData = msg.counterOfferData;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} my-2`}
                >
                  <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2 dark:border-amber-900/50">
                      <span className="text-2xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                        Pazarlık Revizyonu #{cData.version}
                      </span>
                      <span className="text-2xs text-zinc-400">{timeStr}</span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {cData.price.toLocaleString("tr-TR")} TL
                      </span>
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {cData.deliveryDays} Gün Teslimat
                      </span>
                    </div>

                    {cData.note && (
                      <p className="mt-2 text-xs italic text-zinc-700 dark:text-zinc-300 bg-white/60 dark:bg-zinc-900/60 p-2 rounded-lg">
                        "{cData.note}"
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-2xs text-zinc-500">
                      <span>{msg.senderName} tarafından sunuldu</span>
                      {!isMine && isBusiness && !isOfferAccepted && (
                        <button
                          onClick={handleAcceptOffer}
                          className="font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          Kabul Et
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Text / Attachment Bubble
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`group relative max-w-md rounded-2xl px-4 py-3 shadow-xs ${
                    isMine
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {/* Sender title if not mine */}
                  {!isMine && (
                    <div className="mb-1 flex items-center gap-1.5 text-2xs font-semibold text-zinc-500 dark:text-zinc-400">
                      <span>{msg.senderName}</span>
                      <span className="rounded bg-zinc-100 px-1 py-0.2 dark:bg-zinc-700">
                        {msg.senderRole === "business" ? "İşletme" : "Tedarikçi"}
                      </span>
                    </div>
                  )}

                  {/* Attachment Card */}
                  {msg.attachment && (
                    <div className="mb-2 flex items-center gap-3 rounded-xl border border-zinc-200/50 bg-black/5 p-2.5 dark:border-zinc-700/50 dark:bg-white/5">
                      <FileText className="h-6 w-6 shrink-0 opacity-70" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-xs font-semibold">{msg.attachment.name}</div>
                        <div className="text-2xs opacity-60">
                          {Math.round(msg.attachment.size / 1024)} KB
                        </div>
                      </div>
                      <a
                        href={msg.attachment.url}
                        download={msg.attachment.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 hover:bg-black/10 dark:hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  )}

                  {/* Text content */}
                  {msg.content && (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  )}

                  {/* Metadata: Time and read status */}
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-2xs opacity-60 ${
                      isMine ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-400"
                    }`}
                  >
                    <span>{timeStr}</span>
                    {isMine && (
                      <span>
                        {msg.status === "read" || msg.isRead ? (
                          <CheckCheck className="h-3 w-3 text-blue-400 dark:text-blue-600" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. ATTACHMENT PREVIEW CHIP */}
      {selectedFile && (
        <div className="mx-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-4 w-4 text-zinc-500" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedFile.name}</span>
            <span className="text-2xs text-zinc-400">({Math.round(selectedFile.size / 1024)} KB)</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="rounded p-1 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 5. BOTTOM INPUT BAR */}
      <div className="border-t border-zinc-200 bg-white p-3 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* File input button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.doc,.xls,.csv"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Dosya veya Belge Ekle (Maks 10MB)"
            className="rounded-xl border border-zinc-300 p-2.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Quick Counter Offer trigger */}
          {!isOfferAccepted && !isOfferClosed && (
            <button
              type="button"
              onClick={() => setShowCounterModal(true)}
              title="Karşı Teklif Formu"
              className="hidden sm:inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-2.5 py-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              <span>Karşı Teklif</span>
            </button>
          )}

          {/* Textarea */}
          <div className="relative flex-1">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Şartları, ödeme planını veya detayları yazın... (Enter ile gönder)"
              className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedFile) || isSending || isUploading}
            className="inline-flex items-center justify-center rounded-xl bg-zinc-900 p-2.5 text-white shadow-xs hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isSending || isUploading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>

      {/* MODALS */}
      {offer && request && (
        <CounterOfferModal
          isOpen={showCounterModal}
          onClose={() => setShowCounterModal(false)}
          conversationId={conversationId}
          offer={offer}
          request={request}
          currentUserId={currentUserId}
          onSuccess={(newVer, newMsg) => {
            setOffer((prev) =>
              prev
                ? {
                    ...prev,
                    totalPrice: newVer.totalPrice,
                    unitPrice: newVer.unitPrice,
                    deliveryDays: newVer.deliveryDays,
                    version: newVer.version,
                    status: "countered",
                  }
                : null
            );
            setMessages((prev) => [...prev, newMsg]);
            if (onRefreshConversations) onRefreshConversations();
          }}
        />
      )}

      {offer && (
        <OfferHistoryDrawer
          isOpen={showHistoryDrawer}
          onClose={() => setShowHistoryDrawer(false)}
          conversationId={conversationId}
          offerId={offer.id}
        />
      )}

      {agreement && (
        <AgreementSummaryModal
          isOpen={showAgreementModal}
          onClose={() => setShowAgreementModal(false)}
          agreement={agreement}
          currentUserId={currentUserId}
          onStatusUpdate={(updated) => setAgreement(updated)}
        />
      )}
    </div>
  );
}
