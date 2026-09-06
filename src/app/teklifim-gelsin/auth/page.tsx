"use client";

import { useState, useEffect, Suspense } from "react";
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
} from "lucide-react";
import { auth } from "@/lib/firebase/auth";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { TeklifimUserRole, TEKLIFIM_CATEGORIES, TURKEY_CITIES } from "@/types/teklifimGelsin";

function TeklifimAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as TeklifimUserRole) || "business";

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If already logged in, check profile role and redirect to dashboard
        router.push("/teklifim-gelsin/dashboard");
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
        if (!companyName.trim()) {
          throw new Error("Lütfen firma adınızı girin.");
        }
        if (!phone.trim()) {
          throw new Error("Lütfen telefon numaranızı girin.");
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const token = await cred.user.getIdToken();

        // Save profile
        const profileData = {
          uid: cred.user.uid,
          role,
          companyName: companyName.trim(),
          contactName: contactName.trim() || companyName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          city,
          categories: [category],
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // 1. Try Server API
        try {
          await fetch("/api/teklifim-gelsin/profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          });
        } catch {}

        // 2. Client Firestore fallback
        try {
          const { db } = await import("@/lib/firebase/firestore");
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "teklifim_profiles", cred.user.uid), profileData);
        } catch {}

        // 3. LocalStorage cache
        localStorage.setItem(`teklifim_profile_${cred.user.uid}`, JSON.stringify(profileData));

        router.push("/teklifim-gelsin/dashboard");
      } else {
        // Login
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        router.push("/teklifim-gelsin/dashboard");
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

  // Demo Quick Login Helper
  const handleQuickDemoLogin = async (demoRole: TeklifimUserRole) => {
    setError("");
    setLoading(true);
    const demoEmail = demoRole === "business" ? "demo_isletme@teklifimgelsin.com" : "demo_toptanci@teklifimgelsin.com";
    const demoPass = "Demo123456!";
    const demoCompanyName = demoRole === "business" ? "Boğaziçi Cafe & Restoran" : "Mega Ambalaj Sanayi";

    try {
      let userCred;
      try {
        userCred = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (signInErr: any) {
        userCred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
      }

      const token = await userCred.user.getIdToken();
      const profileData = {
        uid: userCred.user.uid,
        role: demoRole,
        companyName: demoCompanyName,
        contactName: demoRole === "business" ? "Ahmet Yılmaz" : "Mehmet Kaya",
        phone: demoRole === "business" ? "0532 111 22 33" : "0542 999 88 77",
        email: demoEmail,
        city: "İstanbul",
        categories: ["Ambalaj & Paketleme", "Gıda & İçecek"],
        isVerified: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        await fetch("/api/teklifim-gelsin/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        });
      } catch {}

      try {
        const { db } = await import("@/lib/firebase/firestore");
        const { doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(db, "teklifim_profiles", userCred.user.uid), profileData);
      } catch {}

      localStorage.setItem(`teklifim_profile_${userCred.user.uid}`, JSON.stringify(profileData));
      router.push("/teklifim-gelsin/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Demo girişi yapılamadı: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/teklifim-gelsin" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">
            <PackageCheck className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white block">
            Teklifim<span className="text-emerald-400">Gelsin</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400">
          {mode === "register" ? "Platforma katılın ve hemen başlayın." : "Hesabınıza giriş yapın."}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#0E1626] py-8 px-6 sm:px-10 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === "register" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Kayıt Ol
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                mode === "login" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Giriş Yap
            </button>
          </div>

          {/* Role Selection (Only shown in register mode) */}
          {mode === "register" && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Kullanıcı Rolünüzü Seçin
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("business")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "business"
                      ? "bg-emerald-500/15 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <Building2 className={`w-5 h-5 mb-1.5 ${role === "business" ? "text-emerald-400" : "text-slate-400"}`} />
                  <div className="text-xs font-bold text-white">İşletmeyim</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ürün/Hizmet Alacağım</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("supplier")}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    role === "supplier"
                      ? "bg-teal-500/15 border-teal-500 text-white shadow-lg shadow-teal-500/10"
                      : "bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  <Truck className={`w-5 h-5 mb-1.5 ${role === "supplier" ? "text-teal-400" : "text-slate-400"}`} />
                  <div className="text-xs font-bold text-white">Toptancıyım</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Teklif Vereceğim</div>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Firma / İşletme Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={role === "business" ? "Örn: Moda Kafe & Bistro" : "Örn: Atlas Toptan Ambalaj"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Yetkili Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Telefon Numarası *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Şehir *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {TURKEY_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Ana Kategori *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#090D16] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {TEKLIFIM_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Şifre *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === "register" ? "Hesabımı Oluştur" : "Giriş Yap"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="pt-4 border-t border-white/10 space-y-2 text-center">
            <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              Hızlı Test / Demo Girişi
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("business")}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-emerald-400 transition-colors cursor-pointer"
              >
                Demo İşletme Girişi
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin("supplier")}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-teal-400 transition-colors cursor-pointer"
              >
                Demo Toptancı Girişi
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070B14] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }
    >
      <TeklifimAuthForm />
    </Suspense>
  );
}
