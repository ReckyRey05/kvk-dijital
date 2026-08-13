import { Metadata } from "next";
import DemoButikClient from "./DemoButikClient";

export const metadata: Metadata = {
  title: "Artisanal Butik & Mağaza | E-Ticaret Konsept Demo | KvK Dijital Çözümler",
  description: "KvK Dijital Çözümler tarafından butik mağazalar, moda markaları ve el işçiliği ürün satan e-ticaret işletmeleri için hazırlanmış filtrelenebilir portföy ve sepet modüllü konsept e-ticaret web sitesi çalışması.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/artisanal-butik-demo",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function ArtisanalButikDemoPage() {
  return <DemoButikClient />;
}
