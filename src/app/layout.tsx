import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import ClientHeader from "@/components/ClientHeader";
import CookieConsent from "@/components/CookieConsent";

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://kvkdijitalcozumler.com'),
  title: {
    default: "KvK Dijital Çözümler | İstanbul Web Tasarım & Dijital Ajans",
    template: "%s | KvK Dijital Çözümler",
  },
  description: "İstanbul merkezli KvK Dijital Çözümler olarak kurumsal web tasarım, e-ticaret ve SEO uyumlu profesyonel web sitesi hizmetleri sunuyoruz.",
  keywords: ["istanbul web tasarım", "web tasarım istanbul", "istanbul web sitesi", "kurumsal web tasarım istanbul", "KvK Dijital Çözümler", "KvK Dijital", "e-ticaret sitesi istanbul", "web sitesi yaptırma istanbul"],
  authors: [{ name: "KvK Dijital Çözümler", url: "https://kvkdijitalcozumler.com" }],
  creator: "KvK Dijital Çözümler",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://kvkdijitalcozumler.com",
    siteName: "KvK Dijital Çözümler",
    title: "KvK Dijital Çözümler | İstanbul Web Tasarım",
    description: "İstanbul merkezli profesyonel web tasarım, e-ticaret ve dijital dönüşüm ajansı.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KvK Dijital Çözümler | İstanbul Web Tasarım",
    description: "İstanbul merkezli profesyonel web tasarım ve dijital dönüşüm ajansı.",
  },
  alternates: {
    canonical: "https://kvkdijitalcozumler.com",
  },
  verification: {
    google: "sANlbaocIrPcxx5Cbmgsxesn-zieUV1fUk5PaoqXpn0",
  },
};

// Font: display:swap + sadece Latin (Türkçe dahil) subset
// Kullanılmayan weight'leri (800,900) kaldırıldı
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: true,
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`scroll-smooth ${inter.variable}`}>
      <head>
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <ClientHeader />
        {children}
        <CookieConsent />
        <Analytics />
        <GoogleAnalytics gaId="G-2REE90FKML" />
        
        {/* Structured Data (JSON-LD) for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://kvkdijitalcozumler.com/#website",
                  "url": "https://kvkdijitalcozumler.com",
                  "name": "KvK Dijital Çözümler",
                  "description": "İstanbul merkezli web tasarım ve dijital ajans",
                  "datePublished": "2024-01-01T08:00:00+03:00",
                  "dateModified": new Date().toISOString(),
                  "publisher": {
                    "@id": "https://kvkdijitalcozumler.com/#organization"
                  }
                },
                {
                  "@type": ["Organization", "LocalBusiness"],
                  "@id": "https://kvkdijitalcozumler.com/#organization",
                  "name": "KvK Dijital Çözümler",
                  "url": "https://kvkdijitalcozumler.com",
                  "logo": "https://kvkdijitalcozumler.com/icon.png",
                  "image": "https://kvkdijitalcozumler.com/icon.png",
                  "telephone": "+905348914905",
                  "email": "iletisim@kvkdijitalcozumler.com",
                  "priceRange": "$$",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "İstanbul",
                    "addressCountry": "TR"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 40.8770,
                    "longitude": 29.2570
                  },
                  "areaServed": [
                    { "@type": "City", "name": "İstanbul" },
                    { "@type": "City", "name": "Kocaeli" },
                    { "@type": "City", "name": "Sakarya" },
                    { "@type": "City", "name": "Bursa" }
                  ],
                  "founder": {
                    "@type": "Person",
                    "name": "Ali Haydar Kavak",
                    "jobTitle": "Kurucu",
                    "url": "https://kvkdijitalcozumler.com/hakkimizda"
                  },
                  "sameAs": [
                    "https://www.instagram.com/kvkdijital",
                    "https://www.linkedin.com/company/kvkdijital",
                    "https://github.com/ReckyRey05"
                  ]
                }
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
