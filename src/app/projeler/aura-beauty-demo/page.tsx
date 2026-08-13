import { Metadata } from "next";
import DemoBeautyClient from "./DemoBeautyClient";

export const metadata: Metadata = {
  title: "Aura Beauty & Güzellik Merkezi | Konsept Demo | KvK Dijital Çözümler",
  description: "KvK Dijital Çözümler tarafından güzellik salonu, bakım merkezi ve estetik işletmeleri için özel olarak tasarlanmış konsept web tasarım çalışması.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/aura-beauty-demo",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function AuraBeautyDemoPage() {
  return <DemoBeautyClient />;
}
