import { Metadata } from "next";
import DamlaAkarsuClient from "./DamlaAkarsuClient";

export const metadata: Metadata = {
  title: "Dt. Damla Akarsu Diş Muayenehanesi | Estetik Diş Hekimliği & İmplant",
  description:
    "Dt. Damla Akarsu Diş Muayenehanesi — İstanbul'da estetik diş hekimliği, dijital gülüş tasarımı, implant, zirkonyum kaplama ve çocuk diş hekimliği alanlarında modern ve güvenilir sağlık hizmeti.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/damla-akarsu"
  },
  openGraph: {
    title: "Dt. Damla Akarsu Diş Muayenehanesi | Sağlıklı ve Estetik Gülüşler",
    description:
      "Modern klinik altyapısı, 3D dijital gülüş tasarımı ve uzman kadrosuyla Dt. Damla Akarsu Diş Muayenehanesi konsept web sitesi.",
    url: "https://kvkdijitalcozumler.com/projeler/damla-akarsu",
    siteName: "KvK Dijital Çözümler Demo Portföyü",
    locale: "tr_TR",
    type: "website"
  }
};

export default function DamlaAkarsuPage() {
  return <DamlaAkarsuClient />;
}
