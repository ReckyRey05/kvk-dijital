import { Metadata } from "next";
import DemoEmlakClient from "./DemoEmlakClient";

export const metadata: Metadata = {
  title: "Vizyon Gayrimenkul & Danışmanlık | Konsept Demo | KvK Dijital Çözümler",
  description: "KvK Dijital Çözümler tarafından emlak ofisleri, gayrimenkul danışmanları ve konut projeleri için hazırlanmış filtrelenebilir portföy özellikli konsept web tasarım çalışması.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/vizyon-gayrimenkul-demo",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function VizyonGayrimenkulDemoPage() {
  return <DemoEmlakClient />;
}
