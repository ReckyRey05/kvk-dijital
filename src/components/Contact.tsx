"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      // Önce E-posta gönderimini yapıyoruz (Çünkü asıl önemli olan size mail gelmesi)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.phone ? `İletişim (Tel: ${formData.phone})` : 'Web Sitesi İletişim',
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Email API responded with an error');
      }

      // E-posta başarılıysa, arka planda Firebase'e de kaydedelim (Bunun için beklemeye gerek yok, asenkron devam edebilir)
      addDoc(collection(db, "contactMessages"), {
        name: formData.name, 
        phone: formData.phone, 
        email: formData.email, 
        message: formData.message,
        service: "Website Contact Form",
        status: "new",
        createdAt: serverTimestamp()
      }).catch(e => console.error("Firebase kayıt hatası:", e));
      
      setSuccess(true);
      setFormData({ name: "", phone: "", email: "", message: "" });
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.message || true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="w-full py-32 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto glass-panel p-8 md:p-16 rounded-[2.5rem]">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-between"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
                  Projenizi birlikte <br />
                  <span className="text-gradient">hayata geçirelim.</span>
                </h2>
                <p className="text-foreground/50 text-lg mb-12 max-w-md">
                  Fikriniz mi var? İşletmenizi dijitale taşımak mı istiyorsunuz?
                  Bize ulaşın, en kısa sürede dönüş yapalım.
                </p>
              </div>

              <div className="space-y-6 text-foreground/70">
                <div>
                  <div className="text-xs uppercase tracking-wider text-foreground/40 mb-1">E-mail</div>
                  <a href="mailto:iletisim@kvkdijitalcozumler.com" className="text-lg font-medium hover:text-accent transition-colors">iletisim@kvkdijitalcozumler.com</a>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-foreground/40 mb-1">KvK Dijital Çözümler</div>
                  <div className="text-lg">İstanbul Web Tasarım & Dijital Ajans</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground/60 px-1">İsim</label>
                    <input 
                      id="name"
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground/60 px-1">Telefon</label>
                    <input 
                      id="phone"
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground/60 px-1">E-mail</label>
                  <input 
                    id="email"
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground/60 px-1">Mesaj</label>
                  <textarea 
                    id="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground resize-none"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-foreground text-background font-medium mt-4 hover:bg-foreground/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? "Gönderiliyor..." : "Gönder"}
                </button>
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-accent/20 border border-accent/30 text-accent text-center text-sm"
                  >
                    Kısa süre içinde sizinle iletişime geçeceğiz.
                  </motion.div>
                )}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-center text-sm"
                  >
                    {typeof error === "string" ? error : "Bir hata oluştu. Lütfen tekrar deneyin."}
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
