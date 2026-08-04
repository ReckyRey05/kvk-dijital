"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";
import { LogoIcon } from "@/components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-panel p-8 md:p-12">
        <div className="flex justify-center mb-8">
          <LogoIcon className="w-16 h-16 text-white" />
        </div>
        
        <h1 className="text-2xl font-medium text-center mb-8">Yönetim Paneli Girişi</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Şifre</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
            />
          </div>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          <button 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-accent text-white font-medium mt-2 hover:bg-accent/90 transition-colors disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
