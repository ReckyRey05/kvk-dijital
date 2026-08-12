"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Component yüklendiğinde localStorage'ı kontrol et
    const consent = localStorage.getItem("kvk_cookie_consent");
    if (!consent) {
      // Eğer daha önce seçim yapılmamışsa banner'ı göster
      // Küçük bir gecikme ekleyerek sayfa yüklendikten sonra zarifçe gelmesini sağlayalım
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("kvk_cookie_consent", "accepted");
    setShowConsent(false);
    // İleride Google Analytics tetiklemelerini buraya bağlayabiliriz
  };

  const declineCookies = () => {
    localStorage.setItem("kvk_cookie_consent", "declined");
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-50 p-4"
        >
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-[50px] pointer-events-none" />
            
            <div className="flex items-start gap-4 relative z-10">
              <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-full bg-accent/10 items-center justify-center text-accent border border-accent/20">
                <Cookie className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">Çerez Tercihleri</h3>
                  <button 
                    onClick={declineCookies}
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  Size daha iyi bir deneyim sunmak, site trafiğini analiz etmek ve içerikleri kişiselleştirmek için çerezleri (cookies) kullanıyoruz. Sitemizi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz. Detaylı bilgi için{" "}
                  <Link href="/cerez-politikasi" className="text-accent hover:underline">
                    Çerez Politikamızı
                  </Link>{" "}
                  inceleyebilirsiniz.
                </p>
                
                <div className="flex flex-col gap-2">
                  <button
                    onClick={acceptCookies}
                    className="w-full bg-accent text-black text-sm font-bold py-3 px-4 rounded-xl hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(var(--accent),0.3)]"
                  >
                    Tümünü Kabul Et ve Devam Et
                  </button>
                  <button
                    onClick={declineCookies}
                    className="w-full text-gray-500 text-xs font-medium py-2 px-4 rounded-xl hover:text-white transition-colors"
                  >
                    Sadece Zorunlu Çerezler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
