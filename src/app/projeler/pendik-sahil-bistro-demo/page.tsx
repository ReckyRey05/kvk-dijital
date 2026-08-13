import { Metadata } from "next";
import DemoBistroClient from "./DemoBistroClient";

export const metadata: Metadata = {
  title: "Pendik Sahil Bistro & Kafe Web Sitesi | Konsept Demo | KvK Dijital Çözümler",
  description: "KvK Dijital Çözümler tarafından restoran, kafe ve gastronomi işletmeleri için özel olarak tasarlanmış örnek web sitesi konsept çalışması.",
  alternates: {
    canonical: "https://kvkdijitalcozumler.com/projeler/pendik-sahil-bistro-demo",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function PendikBistroDemoPage() {
  return <DemoBistroClient />;
}
