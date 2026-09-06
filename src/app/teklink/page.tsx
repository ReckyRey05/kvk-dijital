"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { Link2, ArrowRight, ShieldCheck, CheckCircle2, Zap, Send, FileText } from "lucide-react";

export default function TekLinkLandingPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/teklink/dashboard");
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        if (!businessName.trim()) {
          setError("Lütfen işletme adınızı girin.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Save tenant info to backend
        const token = await userCredential.user.getIdToken();
        await fetch("/api/teklink/forms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "Örnek Müşteri Formu",
            businessName: businessName.trim(),
            description: "TekLink ile oluşturulmuş ilk formunuz.",
            fields: [
              { id: "f1", type: "text", label: "Adınız Soyadınız", required: true, placeholder: "Örn: Ahmet Yılmaz" },
              { id: "f2", type: "phone", label: "Telefon Numaranız", required: true, placeholder: "05XX XXX XX XX" },
              { id: "f3", type: "textarea", label: "Not veya Talebiniz", required: false, placeholder: "Belirtmek istediğiniz detaylar..." }
            ]
          }),
        }).catch(() => {});
      }
      router.push("/teklink/dashboard");
    } catch (err: any) {
      console.error("TekLink Auth Error:", err);
      let msg = "Giriş yapılamadı. Bilgilerinizi kontrol edin.";
      if (err.code === "auth/email-already-in-use") {
        msg = "Bu e-posta adresi ile zaten bir hesap var. Lütfen giriş yapın.";
      } else if (err.code === "auth/weak-password") {
        msg = "Şifreniz en az 6 karakter olmalıdır.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "E-posta veya şifre hatalı.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-between font-sans selection:bg-[#2563EB]">
      {/* Top Navbar */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">TekLink</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Müşteriden bilgi toplama işini tek linke indirin
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Pitch */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Ultra Basit Bilgi & Evrak Toplama</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Müşteriden bilgi toplamak <br className="hidden sm:inline" />
            artık <span className="text-blue-500">tek link.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
            Formunu oluştur, tek linki kopyala, WhatsApp veya SMS ile müşterine gönder. 
            Müşterin hesap açmadan, saniyeler içinde bilgilerini ve evraklarını göndersin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-xl mx-auto lg:mx-0 text-left">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs mb-2">1</div>
              <div className="font-bold text-sm text-white">Form Oluştur</div>
              <div className="text-xs text-slate-400 mt-1">İstediğin soruları ve evrak alanlarını ekle.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">2</div>
              <div className="font-bold text-sm text-white">TekLink Paylaş</div>
              <div className="text-xs text-slate-400 mt-1">Tek tuşla kopyala, müşteriye anında ulaştır.</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs mb-2">3</div>
              <div className="font-bold text-sm text-white">Cevapları Gör</div>
              <div className="text-xs text-slate-400 mt-1">Gelen tüm evrak ve verileri panelinde incele.</div>
            </div>
          </div>
        </div>

        {/* Right Auth Box */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-[#111827] rounded-3xl p-8 border border-white/10 shadow-2xl space-y-6">
            
            {/* Tab switch */}
            <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isLogin ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isLogin ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Ücretsiz Kaydol
              </button>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {isLogin ? "İşletme Girişi" : "TekLink Hesabı Oluşturun"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin ? "Panelinize erişmek için e-posta ve şifrenizi girin." : "2 dakikada ilk formunuzu oluşturun ve linkinizi alın."}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {!isLogin && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">İşletme Adınız</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Örn: Özkan Hukuk Bürosu veya Akın Otomotiv"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">E-posta Adresi</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@isletme.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Şifre</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? "Panele Giriş Yap" : "Hesap Oluştur ve Başla"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-[11px] text-slate-500">
              Gereksiz popup yok • Uzun onboarding yok • Doğrudan kullanım
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-slate-500">
        TekLink © {new Date().getFullYear()} — Tüm hakları saklıdır.
      </footer>
    </div>
  );
}
