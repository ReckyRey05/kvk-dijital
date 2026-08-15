"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { MessageSquare, Send, CheckCircle2, ArrowRight } from "lucide-react";

const serviceOptions = [
  "Web Tasarım",
  "Kurumsal Web Sitesi",
  "E-Ticaret Web Sitesi",
  "Özel Yazılım",
  "Diğer / Danışmanlık"
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Web Tasarım",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | boolean>(false);

  // Quick estimator selection helper
  const handleQuickSelect = (selectedService: string) => {
    setFormData(prev => ({
      ...prev,
      service: selectedService,
      message: prev.message || `${selectedService} projemiz için detaylı teklif ve bilgi almak istiyoruz.`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Lütfen isim, e-posta ve mesaj alanlarını eksiksiz doldurun.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(false);

    try {
      // Sunucu tarafına istek gönderimi (/api/contact üzerinden E-posta ve Firestore Admin kaydı)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: formData.service,
          subject: `Teklif Talebi - ${formData.service} (${formData.phone || 'Tel Belirtilmedi'})`,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'İletişim isteği gönderilemedi');
      }
      
      setSuccess(true);
      setFormData({ name: "", phone: "", email: "", service: "Web Tasarım", message: "" });
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.message || true);
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent("Merhaba, web sitesi yaptırmak istiyorum. Projem hakkında detaylı bilgi almak istiyorum.");
  const whatsappUrl = `https://wa.me/905348914905?text=${whatsappMessage}`;

  return (
    <section id="iletisim" className="w-full pt-8 pb-20 md:pt-12 md:pb-24 scroll-mt-20 md:scroll-mt-24 relative">
      <div id="contact" className="scroll-mt-20 md:scroll-mt-24 absolute top-0" />
      <div className="container mx-auto px-6">

        {/* Mini Proje Ön Değerlendirme Aracı */}
        <div className="max-w-6xl mx-auto mb-10 md:mb-12 glass-panel p-5 sm:p-8 md:p-10 rounded-2xl md:rounded-[2rem] border-accent/20">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">Hızlı Proje Değerlendirme</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Hangi Hizmete İhtiyacınız Var?</h3>
            <p className="text-foreground/70 text-xs sm:text-sm">Aşağıdaki hizmetlerden birini seçerek mesaj alanınızı otomatik oluşturabilirsiniz.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-3 lg:grid-cols-5 md:gap-3" role="group" aria-label="Hizmet Türü Seçimi">
            {serviceOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                aria-pressed={formData.service === opt}
                aria-label={`Hizmet Seçimi: ${opt}`}
                onClick={() => handleQuickSelect(opt)}
                className={`px-3.5 py-2.5 sm:p-4 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                  formData.service === opt
                    ? "bg-accent/20 border-accent text-accent shadow-lg shadow-accent/10"
                    : "bg-white/5 border-white/10 text-foreground/80 hover:bg-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${formData.service === opt ? "text-accent" : "text-white/30"}`} />
                <span className="whitespace-nowrap sm:whitespace-normal">{opt}</span>
              </button>
            ))}
          </div>
        </div>

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
                <p className="text-foreground/70 text-lg mb-8 max-w-md">
                  Fikriniz mi var? İşletmenizi dijitale taşımak mı istiyorsunuz?
                  Bize ulaşın, projenizi analiz edip en uygun teklifi sunalım.
                </p>

                {/* WhatsApp Hızlı İletişim Butonu */}
                <div className="mb-12">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp üzerinden anında iletişime geçin"
                    className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/20 transition-all group"
                  >
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                    <span>WhatsApp'tan Anında Yazın</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="space-y-6 text-foreground/70 border-t border-white/10 pt-8">
                <div>
                  <div className="text-xs uppercase tracking-wider text-foreground/40 mb-1">E-mail</div>
                  <a href="mailto:iletisim@kvkdijitalcozumler.com" className="text-lg font-medium hover:text-accent transition-colors">iletisim@kvkdijitalcozumler.com</a>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-foreground/40 mb-1">Lokasyon</div>
                  <div className="text-lg font-medium text-foreground/90">İstanbul, Türkiye</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} aria-label="Teklif ve İletişim Formu" className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground/70 px-1">İsim / Firma *</label>
                    <input 
                      id="name"
                      type="text" 
                      required
                      placeholder="Adınız veya firmanız"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground/70 px-1">Telefon</label>
                    <input 
                      id="phone"
                      type="tel" 
                      placeholder="05XX XXX XX XX"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground/70 px-1">E-mail *</label>
                    <input 
                      id="email"
                      type="email" 
                      required
                      placeholder="ornek@firma.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="service" className="text-sm font-medium text-foreground/70 px-1">İlgilenilen Hizmet</label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent transition-all text-foreground"
                    >
                      {serviceOptions.map(opt => (
                        <option key={opt} value={opt} className="bg-[#0a0a0a] text-white">{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground/70 px-1">Proje Detayları / Mesaj *</label>
                  <textarea 
                    id="message"
                    rows={4}
                    required
                    placeholder="Projenizin hedefleri ve detayları hakkında kısaca bilgi verin..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent focus:bg-white/10 transition-all text-foreground resize-none"
                  />
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="kvkk"
                    required
                    className="mt-0.5 w-4 h-4 rounded bg-[#050505] border-white/20 text-accent focus:ring-accent focus:ring-offset-0 shrink-0 cursor-pointer"
                  />
                  <label htmlFor="kvkk" className="text-xs text-foreground/60 leading-relaxed cursor-pointer">
                    <a href="/kvkk" target="_blank" className="text-accent hover:underline">KVKK Aydınlatma Metni</a>'ni ve <a href="/gizlilik-politikasi" target="_blank" className="text-accent hover:underline">Gizlilik Politikası</a>'nı okudum, kişisel verilerimin iletişim amacıyla işlenmesini onaylıyorum.
                  </label>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-accent text-background font-bold mt-4 hover:bg-accent/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Gönderiliyor..." : "Teklif İste / Gönder"}
                </button>
                
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-accent/20 border border-accent/30 text-accent text-center text-sm font-medium"
                  >
                    Talebiniz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.
                  </motion.div>
                )}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-center text-sm font-medium"
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
