"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  QrCode,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

function EtiketleAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/etiketle/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (!businessName.trim()) {
          throw new Error("Lütfen işletme adınızı girin.");
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        localStorage.setItem(`etiketle_business_${cred.user.uid}`, businessName.trim());
        router.push("/etiketle/dashboard");
      } else if (mode === "login") {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.push("/etiketle/dashboard");
      } else if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email.trim());
        setResetSent(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("Bu e-posta adresi ile zaten kayıt olunmuş. Giriş yapmayı deneyin.");
      } else if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("E-posta veya şifre hatalı.");
      } else if (err.code === "auth/weak-password") {
        setError("Şifre en az 6 karakter olmalıdır.");
      } else {
        setError(err.message || "İşlem sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    const demoEmail = "demo@etiketle.app";
    const demoPass = "Demo123456!";

    try {
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (signInErr: any) {
        const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
        localStorage.setItem(`etiketle_business_${cred.user.uid}`, "Örnek Depo & Atölye");
      }
      router.push("/etiketle/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Demo girişi yapılamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 selection:bg-amber-500 selection:text-black font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/etiketle" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-500/20">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white block">
            Etiket<span className="text-amber-400">le</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400">
          {mode === "register"
            ? "Yeni işletme hesabı oluşturun."
            : mode === "login"
            ? "Hesabınıza giriş yapın."
            : "Şifre sıfırlama bağlantısı alın."}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0E121A] py-8 px-6 sm:px-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Mode Switch Tabs */}
          {mode !== "forgot" && (
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {resetSent ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center space-y-2">
              <p className="font-bold">Sıfırlama bağlantısı gönderildi!</p>
              <p className="text-[11px] text-slate-300">
                E-posta kutunuzu kontrol edin. Talimatları izleyerek şifrenizi yenileyebilirsiniz.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setResetSent(false);
                }}
                className="text-amber-400 underline font-bold mt-2 inline-block cursor-pointer"
              >
                Giriş Ekranına Dön
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    İşletme / Kurum Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Örn: Atlas Lojistik veya Pro Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  E-posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@firma.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Şifre *
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setError("");
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        Şifremi unuttum?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "register"
                        ? "Hesabımı Oluştur"
                        : mode === "login"
                        ? "Giriş Yap"
                        : "Sıfırlama Bağlantısı Gönder"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {mode === "forgot" && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Vazgeç ve Giriş Yap
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Quick Demo Login Option */}
          <div className="pt-4 border-t border-white/10 text-center space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Hızlı Test / Demo
            </span>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              Demo İşletme Olarak Giriş Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EtiketleAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090E] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <EtiketleAuthForm />
    </Suspense>
  );
}
