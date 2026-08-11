import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kvkdijitalcozumler.com'),
  title: {
    default: "KvK Digital | Premium Dijital Ajans",
    template: "%s | KvK Digital",
  },
  description: "İstanbul merkezli dijital ajans olarak Türkiye geneline modern, hızlı ve ölçeklenebilir web tasarım, özel yazılım ve yapay zeka çözümleri sunuyoruz.",
  keywords: ["dijital ajans", "istanbul web tasarım", "istanbul dijital ajans", "özel yazılım", "yapay zeka", "seo", "kurumsal kimlik", "KvK Digital", "türkiye web ajansı"],
  authors: [{ name: "KvK Digital", url: "https://kvkdijitalcozumler.com" }],
  creator: "KvK Digital",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://kvkdijitalcozumler.com",
    siteName: "KvK Digital",
    title: "KvK Digital | Premium Dijital Ajans",
    description: "Modern, hızlı ve ölçeklenebilir dijital çözümler üretiyoruz.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KvK Digital | Premium Dijital Ajans",
    description: "Modern, hızlı ve ölçeklenebilir dijital çözümler üretiyoruz.",
  },
  alternates: {
    canonical: "https://kvkdijitalcozumler.com",
  },
};

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import ClientHeader from "@/components/ClientHeader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={inter.className}>
        <ClientHeader />
        {children}
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />}
        
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              "name": "KvK Digital",
              "image": "https://kvkdijitalcozumler.com/icon.png",
              "url": "https://kvkdijitalcozumler.com",
              "telephone": "+905348914905",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Istanbul",
                "addressCountry": "TR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 40.8770,
                "longitude": 29.2570
              },
              "url": "https://kvkdijitalcozumler.com",
              "sameAs": [
                "https://kvkdijitalcozumler.com"
              ],
              "description": "Modern, hızlı ve ölçeklenebilir dijital çözümler üretiyoruz. Web tasarımı, özel yazılım ve yapay zeka çözümleri ile işletmenizi geleceğe taşıyın.",
              "priceRange": "$$"
            })
          }}
        />
      </body>
    </html>
  );
}
