import { Metadata } from "next";
import DemoHukukClient from "./DemoHukukClient";

export const metadata: Metadata = {
  title: "Prestij Hukuk & Danışmanlık | Konsept Demo | KvK Dijital Çözümler",
  description: "KvK Dijital Çözümler tarafından hukuk büroları, mali müşavirler ve B2B danışmanlık işletmeleri için hazırlanmış kurumsal konsept web tasarım çalışması.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/prestij-hukuk-demo",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function PrestijHukukDemoPage() {
  return <DemoHukukClient />;
}
