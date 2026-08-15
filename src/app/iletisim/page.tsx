import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim & Ücretsiz Web Tasarım Teklifi | KvK Dijital Çözümler",
  description: "KvK Dijital Çözümler ile iletişime geçin. İstanbul web tasarım, kurumsal web sitesi ve e-ticaret projeleriniz için 24 saat içinde ücretsiz teklif alın.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/iletisim",
  }
};

export default function IletisimPage() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-hidden pt-24 bg-background text-foreground">
      <div className="w-full">
        <Contact />
      </div>

      <Footer />
    </main>
  );
}
