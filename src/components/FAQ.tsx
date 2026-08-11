"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Web sitesi süreci ne kadar sürüyor?",
    answer: "Projenin kapsamına ve ihtiyaçlarına göre değişmekle birlikte, standart bir kurumsal web sitesi genellikle 1-2 hafta içerisinde teslim edilmektedir. Özel yazılım gerektiren projelerde bu süre detaylı bir analizle belirlenir."
  },
  {
    question: "Fiyatlandırma nasıl yapılıyor?",
    answer: "Fiyatlandırma; sitenin tasarımı, sayfa sayısı, e-ticaret altyapısı olup olmadığı ve ekstra yazılım ihtiyaçlarına (örn. rezervasyon sistemi, çoklu dil) göre proje bazlı olarak belirlenmektedir. Sürpriz maliyetler olmadan baştan net bir teklif sunuyoruz."
  },
  {
    question: "Domain ve Hosting (Alan adı ve Barındırma) kime ait oluyor?",
    answer: "Tüm domain ve hosting hesapları, ve sitenin tüm kaynak kodları tamamen sizin adınıza kaydedilir ve %100 sizin mülkiyetinizde olur. Biz sadece kurulum ve yönetim süreçlerini üstleniyoruz."
  },
  {
    question: "Siteniz arama motorlarına (SEO) uyumlu mu?",
    answer: "Evet, geliştirdiğimiz tüm web siteleri en güncel SEO (Arama Motoru Optimizasyonu) standartlarına uygun kodlanır. Hızlı yükleme süreleri, mobil uyumluluk ve temiz kod yapısı sayesinde Google'da daha kolay sıralama alırsınız."
  },
  {
    question: "Mobil cihazlarda sorunsuz çalışıyor mu?",
    answer: "Kesinlikle. Sitelerimiz 'Mobile First' (Önce Mobil) prensibiyle tasarlanır. Ziyaretçilerinizin çoğu mobil cihazlardan geleceği için telefon ve tabletlerde kusursuz bir deneyim sunar."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Sıkça Sorulan <span className="text-accent">Sorular</span>
            </h2>
            <p className="text-foreground/60 text-lg">
              Süreçlerimiz ve çalışma prensiplerimiz hakkında merak ettikleriniz.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`glass-panel overflow-hidden transition-colors duration-300 ${
                  openIndex === index ? "border-accent/30 bg-accent/5" : ""
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-accent transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`} 
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="p-6 pt-0 text-foreground/70 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
