"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  PackageCheck,
  Building2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
  ArrowLeft,
  Sun,
  Moon,
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { TeklifimUserRole, TEKLIFIM_CATEGORIES, TURKEY_CITIES } from "@/types/teklifimGelsin";
import { TeklifimThemeProvider, useTeklifimTheme } from "@/context/TeklifimThemeContext";

function TeklifimAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as TeklifimUserRole) || "business";
  const { theme, toggleTheme } = useTeklifimTheme();

  const [mode, setMode] = useState<"login" | "register">("register");
  const [role, setRole] = useState<TeklifimUserRole>(initialRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [category, setCategory] = useState<string>("Ambalaj & Paketleme");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        router.push("/teklifim-gelsin/dashboard");
      }
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (!companyName.trim()) {
          throw new Error("Lütfen firma adınızı girin.");
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = cred.user;
        const token = await user.getIdToken();

        const payload = {
          role,
          companyName: companyName.trim(),
          contactName: contactName.trim() || "Yetkili",
          phone: phone.trim(),
          email: email.trim(),
          city,
          categories: role === "supplier" ? [category] : [],
        };

        // Save profile
        try {
          await fetch("/api/teklifim-gelsin/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
        } catch {}

        localStorage.setItem(`teklifim_profile_${user.uid}`, JSON.stringify({ uid: user.uid, ...payload }));
        router.push("/teklifim-gelsin/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        router.push("/teklifim-gelsin/dashboard");
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Bu e-posta adresi ile zaten kayıt olunmuş. Lütfen giriş yapın.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("E-posta veya şifre hatalı.");
      } else if (err.code === "auth/weak-password") {
        setError("Şifreniz en az 6 karakter olmalıdır.");
      } else {
        setError(err.message || "İşlem sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFastDemoLogin = async (demoRole: TeklifimUserRole) => {
    setLoading(true);
    setError("");

    const demoEmail = demoRole === "business" ? "isletme@teklifimgelsin.demo" : "toptanci@teklifimgelsin.demo";
    const demoPass = "Demo123456!";

    try {
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
        router.push("/teklifim-gelsin/dashboard");
        return;
      } catch {}

      // If does not exist, create
      const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
      const user = cred.user;
      const token = await user.getIdToken();

      const payload = {
        role: demoRole,
        companyName: demoRole === "business" ? "Moda Artisan Kafe" : "Atlas Toptan & İmalat A.Ş.",
        contactName: demoRole === "business" ? "Ali Demir" : "Murat Kaya",
        phone: demoRole === "business" ? "0532 100 20 30" : "0212 555 10 20",
        email: demoEmail,
        city: "İstanbul",
        categories: demoRole === "supplier" ? ["Ambalaj & Paketleme", "Gıda & İçecek"] : [],
      };

      try {
        await fetch("/api/teklifim-gelsin/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } catch {}

      localStorage.setItem(`teklifim_profile_${user.uid}`, JSON.stringify({ uid: user.uid, ...payload }));
      router.push("/teklifim-gelsin/dashboard");
    } catch (err: any) {
      setError("Demo giriş açılamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      {/* TOP HEADER */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 flex items-center justify-between">
        <Link
          href="/teklifim-gelsin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        <button
          onClick={toggleTheme}
          aria-label="Tema Değiştir"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121824] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 pt-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
          <PackageCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          {mode === "register" ? "Teklifim Gelsin'e Katılın" : "Hesabınıza Giriş Yapın"}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {mode === "register"
            ? "Tedarik ağında yerinizi alın, fiyat toplayın veya teklif verin."
            : "Taleplerinizi ve tekliflerinizi yönetmek için devam edin."}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#0E131F] py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
          {/* MODE TABS */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Kayıt Ol
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Giriş Yap
            </button>
          </div>

          {/* ROLE SELECTOR (Only register) */}
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Hesap Türünüzü Seçin
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("business")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "business"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-1.5 ${role === "business" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">İşletmeyim</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Ürün/Hizmet Alacağım</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("supplier")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "supplier"
                      ? "bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm ring-1 ring-blue-500/30"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Truck className={`w-5 h-5 mb-1.5 ${role === "supplier" ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`} />
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Toptancıyım</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Teklif Vereceğim</div>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Firma / İşletme Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={role === "business" ? "Örn: Moda Kafe & Bistro" : "Örn: Öztürk Ambalaj Sanayi"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Yetkili Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Şehir
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 font-medium"
                    >
                      {TURKEY_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {role === "supplier" && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Ana Kategori
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-600 font-medium"
                      >
                        {TEKLIFIM_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                E-Posta Adresi *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirketiniz.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Şifre *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>{mode === "register" ? "Hesap Oluştur ve Başla" : "Giriş Yap"}</span>
                )}
              </button>
            </div>
          </form>

          {/* FAST DEMO LOGIN BUTTONS */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">
              Tek Tıkla Demo Giriş
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin("business")}
                className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>İşletme Demoları</span>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin("supplier")}
                className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Toptancı Demoları</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeklifimAuthPage() {
  return (
    <TeklifimThemeProvider>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#070B14] flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <TeklifimAuthForm />
      </Suspense>
    </TeklifimThemeProvider>
  );
}
