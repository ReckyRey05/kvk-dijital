import { Metadata } from "next";
import PomakLazerClient from "./PomakLazerClient";

export const metadata: Metadata = {
  title: "Pomak Lazer | Endüstriyel Lazer Kesim & Markalama Sistemleri",
  description: "Pomak Lazer için hazırlanan yeni nesil kurumsal web tasarım konsepti. Yüksek hassasiyetli fiber lazer sac kesim makineleri, lazer markalama, boru lazer sistemleri ve orijinal optik yedek parçalar.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/pomak-lazer",
  },
  openGraph: {
    title: "Pomak Lazer | Endüstriyel Lazer Kesim & Markalama Sistemleri",
    description: "Pomak Lazer için hazırlanan yeni nesil kurumsal web tasarım konsepti. Yüksek hassasiyetli fiber lazer sac kesim makineleri, lazer markalama, boru lazer sistemleri ve orijinal optik yedek parçalar.",
    url: "https://kvkdijitalcozumler.com/projeler/pomak-lazer",
    siteName: "KvK Dijital Çözümler",
    images: [
      {
        url: "https://kvkdijitalcozumler.com/images/pomak-lazer/machines/hero-fiber-laser.png",
        width: 1200,
        height: 630,
        alt: "Pomak Lazer Endüstriyel Fiber Lazer Kesim Sistemleri",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomak Lazer | Endüstriyel Lazer Kesim & Markalama Sistemleri",
    description: "Pomak Lazer için hazırlanan yeni nesil kurumsal web tasarım konsepti. Yüksek hassasiyetli fiber lazer sac kesim ve markalama teknolojileri.",
    images: ["https://kvkdijitalcozumler.com/images/pomak-lazer/machines/hero-fiber-laser.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PomakLazerPage() {
  return <PomakLazerClient />;
}
