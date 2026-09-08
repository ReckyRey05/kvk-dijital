"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, Headphones } from "lucide-react";
import { useItemSepetiTheme } from "@/context/ItemSepetiThemeContext";

interface ChatMessage {
  id: string;
  sender: "user" | "support" | "bot";
  text: string;
  timestamp: string;
}

const FAQ_SUGGESTIONS = [
  "Siparişim ne zaman teslim edilir?",
  "Nasıl bakiye yükleyebilirim?",
  "İlanım ne zaman onaylanır?",
  "Canlı destek temsilcisine bağlan",
];

export default function ItemSepetiLiveSupportWidget() {
  const { theme } = useItemSepetiTheme();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "support",
      text: "Merhaba! İtemSepeti 7/24 Destek Hattı'na hoş geldiniz. Size nasıl yardımcı olabiliriz?",
      timestamp: "Şimdi",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = "Talebiniz destek ekibimize iletildi. Bir operatörümüz 1-2 dakika içinde sizinle iletişime geçecektir.";

      const lower = text.toLowerCase();
      if (lower.includes("teslim") || lower.includes("sipari")) {
        botResponse = "Siparişleriniz satıcı teslimat süresine (SLA) göre ortalama 15-60 dakika içinde tamamlanır. Sipariş detayınızı 'Siparişlerim' sayfasından takip edebilirsiniz.";
      } else if (lower.includes("bakiye") || lower.includes("havale") || lower.includes("eft")) {
        botResponse = "Banka havalesi ile bakiye yüklemek için 'Bakiye Yükle' sayfasına giderek anlaşmalı IBAN hesaplarımıza gönderim yapabilir ve bildirim formunu doldurabilirsiniz.";
      } else if (lower.includes("ilan") || lower.includes("onay")) {
        botResponse = "İlanlar kurallara uygunsa otomatik olarak anında veya moderatörlerimizce maksimum 15 dakika içinde onaylanarak yayına alınır.";
      } else if (lower.includes("temsilci") || lower.includes("canlı")) {
        botResponse = "Müşteri temsilcisi sırasına alındınız. Sıranız: #1. Lütfen bu pencereyi kapatmayın, bağlanıyorsunuz...";
      }

      const replyMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "support",
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, replyMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="7/24 Canlı Destek"
          className="flex items-center gap-2.5 px-4 py-3 rounded-full text-white font-bold text-xs shadow-lg hover:shadow-xl transition-transform active:scale-95 cursor-pointer bg-[#D99532] hover:bg-[#c2842b]"
        >
          <div className="relative">
            <Headphones className="w-5 h-5" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white absolute -top-0.5 -right-0.5"></span>
          </div>
          <span>7/24 Canlı Destek</span>
        </button>
      )}

      {isOpen && (
        <div
          className={`w-[360px] sm:w-[400px] h-[520px] rounded-[18px] border flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 ${
            isDark ? "bg-[#161921] border-[#282C3A] text-[#EDEEF2]" : "bg-white border-[#DCDDE1] text-[#17191F]"
          }`}
        >
          <div className="p-4 border-b flex items-center justify-between bg-[#D99532] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black leading-tight">İtemSepeti Destek</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-white/90">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Çevrimiçi &bull; Ortalama Yanıt: 1 Dk</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            <div className="text-center py-1">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/5 dark:bg-white/5 text-[#9498A6]">
                Uçtan Uca Güvenli Destek Görüşmesi
              </span>
            </div>

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-[12px] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-[#D99532] text-white rounded-br-none"
                      : isDark
                      ? "bg-[#212530] text-[#EDEEF2] rounded-bl-none border border-[#282C3A]"
                      : "bg-[#F0F1F3] text-[#17191F] rounded-bl-none"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[#9498A6] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2 rounded-[8px] bg-black/5 dark:bg-white/5 w-20 text-[#9498A6]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9498A6] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9498A6] animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9498A6] animate-bounce delay-200"></span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t border-black/5 dark:border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar">
            {FAQ_SUGGESTIONS.map((faq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(faq)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-[#DCDDE1] dark:border-[#282C3A] hover:border-[#D99532] transition-colors whitespace-nowrap bg-black/5 dark:bg-white/5 text-inherit cursor-pointer"
              >
                {faq}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-[#DCDDE1] dark:border-[#282C3A] flex items-center gap-2">
            <input
              type="text"
              placeholder="Mesajınızı yazın..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              className="flex-1 h-10 px-3 rounded-[8px] text-xs bg-black/5 dark:bg-black/30 border border-[#DCDDE1] dark:border-[#282C3A] text-inherit focus:ring-1 focus:ring-[#D99532] focus:outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="h-10 px-3.5 rounded-[8px] bg-[#D99532] hover:bg-[#c2842b] disabled:opacity-50 text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
