import { Metadata } from "next";
import PomakLazerClient from "./PomakLazerClient";

export const metadata: Metadata = {
  title: "Pomak Lazer | Endüstriyel Fiber Lazer Kesim & Markalama Sistemleri | KvK Dijital Çözümler",
  description: "Pomak Lazer kurumsal web tasarım konsept demosu. Yüksek hassasiyetli fiber lazer sac kesim makineleri, lazer markalama, boru lazer sistemleri ve orijinal yedek parça çözümleri.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/pomak-lazer",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PomakLazerPage() {
  return <PomakLazerClient />;
}
