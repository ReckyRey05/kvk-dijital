"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Shield, AlertCircle, Info, Lock } from "lucide-react";
import ItemSepetiButton from "@/components/itemsepeti/ui/ItemSepetiButton";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "buyer" | "seller" | "system" | "admin";
  content: string;
  timestamp: string;
  isFiltered?: boolean;
}

interface OrderChatProps {
  orderId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: "buyer" | "seller" | "admin";
}

// Regex to detect sensitive off-platform transaction attempts (phone, IBAN, discord, telegram, external links)
const PHONE_REGEX = /(\+90|0)?\s*[1-9]\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g;
const IBAN_REGEX = /TR\d{2}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{4}\s*\d{2}/gi;
const EXTERNAL_LINKS_REGEX = /(https?:\/\/|www\.|discord(\.gg|\.com|app\.com)\/|t\.me\/|wa\.me\/|instagram\.com\/|twitter\.com\/)[^\s]+/gi;

export function sanitizeMessage(input: string): { text: string; hasViolation: boolean } {
  let hasViolation = false;
  let text = input;

  if (PHONE_REGEX.test(text)) {
    hasViolation = true;
    text = text.replace(PHONE_REGEX, "[Sistem tarafından gizlenen telefon no]");
  }
  if (IBAN_REGEX.test(text)) {
    hasViolation = true;
    text = text.replace(IBAN_REGEX, "[Sistem tarafından gizlenen IBAN]");
  }
  if (EXTERNAL_LINKS_REGEX.test(text)) {
    hasViolation = true;
    text = text.replace(EXTERNAL_LINKS_REGEX, "[Sistem tarafından gizlenen harici bağlantı]");
  }

  return { text, hasViolation };
}

export default function ItemSepetiOrderChat({
  orderId,
  currentUserId,
  currentUserName,
  currentUserRole,
}: OrderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: "sys_welcome",
        senderId: "system",
        senderName: "İtemSepeti Güvenlik Botu",
        senderRole: "system",
        content:
          "Sipariş odasına hoş geldiniz. Tüm yazışmalarınız İtemSepeti Escrow güvencesi altındadır. Site dışı iletişim (Telefon, WhatsApp, Discord, IBAN paylaşımı) dolandırıcılık riskine karşı sistemce engellenmektedir.",
        timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [inputVal, setInputVal] = useState("");
  const [filterWarning, setFilterWarning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const { text, hasViolation } = sanitizeMessage(inputVal.trim());

    if (hasViolation) {
      setFilterWarning("Güvenliğiniz için mesajınızdaki harici iletişim bilgileri (telefon, IBAN veya link) otomatik olarak gizlendi.");
    } else {
      setFilterWarning(null);
    }

    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      content: text,
      timestamp: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      isFiltered: hasViolation,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal("");
  };

  return (
    <div className="bg-white dark:bg-[#1c2230] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col h-[480px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Sipariş Teslimat & Kanıt Odası
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                Kayıt Altında
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Alıcı ve Satıcı arasındaki kanıt niteliğindeki sohbet alanı
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Escrow Koruma</span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-sm">
        {messages.map((msg) => {
          if (msg.senderRole === "system") {
            return (
              <div
                key={msg.id}
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2"
              >
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-0.5">{msg.senderName}</span>
                  {msg.content}
                </div>
              </div>
            );
          }

          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isMe ? "Sen" : msg.senderName}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded text-slate-500 bg-slate-100 dark:bg-slate-800">
                  {msg.senderRole}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe
                    ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700"
                }`}
              >
                {msg.content}
              </div>
              {msg.isFiltered && (
                <span className="text-[10px] text-red-500 dark:text-red-400 flex items-center gap-1 mt-1 px-1">
                  <AlertCircle className="w-3 h-3" /> Harici bilgi filtrelendi
                </span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {filterWarning && (
        <div className="mb-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{filterWarning}</span>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Teslimat kodu, karakter adı veya bilgi yazın..."
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
        <ItemSepetiButton type="submit" variant="primary" size="md">
          <Send className="w-4 h-4" />
        </ItemSepetiButton>
      </form>
    </div>
  );
}
