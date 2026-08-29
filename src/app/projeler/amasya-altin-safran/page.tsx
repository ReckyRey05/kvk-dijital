import { Metadata } from "next";
import AmasyaAltinSafranClient from "./AmasyaAltinSafranClient";

export const metadata: Metadata = {
  title: "Amasya Altın Safran | %100 Saf Doğal Safran & Alım Garantili Tohum",
  description: "Amasya Altın Safran için geliştirilen lüks kurumsal web tasarım konsepti. İyi tarım sertifikalı saf Amasya safranı, hediyelik sandık setleri ve alım garantili safran soğanı yetiştiriciliği.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/amasya-altin-safran",
  },
  openGraph: {
    title: "Amasya Altın Safran | %100 Saf Doğal Safran & Alım Garantili Tohum",
    description: "Amasya Altın Safran için geliştirilen lüks kurumsal web tasarım konsepti. İyi tarım sertifikalı saf Amasya safranı ve alım garantili safran soğanı.",
    url: "https://kvkdijitalcozumler.com/projeler/amasya-altin-safran",
    siteName: "KvK Dijital Çözümler",
    images: [
      {
        url: "https://kvkdijitalcozumler.com/images/amasya-altin-safran/hero/banner-01.png",
        width: 1200,
        height: 630,
        alt: "Amasya Altın Safran Doğal ve Saf Safran Baharatı",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amasya Altın Safran | %100 Saf Doğal Safran & Alım Garantili Tohum",
    description: "Amasya Altın Safran için geliştirilen lüks kurumsal web tasarım konsepti. İyi tarım sertifikalı saf Amasya safranı.",
    images: ["https://kvkdijitalcozumler.com/images/amasya-altin-safran/hero/banner-01.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AmasyaAltinSafranPage() {
  return <AmasyaAltinSafranClient />;
}
