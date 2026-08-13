import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
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
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
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
        {/* DNS prefetch for GTM tracking */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      <body className={inter.className}>
        <ClientHeader />
        {children}
        <CookieConsent />
        <Analytics />
        
        {/* GTM: lazyOnload — kullanıcı etkileşiminde yüklenir, LCP'yi engellemez */}
        <Script
          id="gtm-script"
          src={`https://www.googletagmanager.com/gtag/js?id=G-2REE90FKML`}
          strategy="lazyOnload"
        />
        <Script id="gtm-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2REE90FKML', { send_page_view: false });
          `}
        </Script>
        
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
                  "name": "KVK Dijital Çözümler",
                  "alternateName": "KVK Dijital",
                  "description": "İstanbul merkezli profesyonel web tasarım, yazılım ve dijital ajans",
                  "publisher": {
                    "@id": "https://kvkdijitalcozumler.com/#organization"
                  }
                },
                {
                  "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
                  "@id": "https://kvkdijitalcozumler.com/#organization",
                  "name": "KVK Dijital Çözümler",
                  "alternateName": ["KVK Dijital", "KvK Dijital", "KvK Dijital Çözümler"],
                  "url": "https://kvkdijitalcozumler.com",
                  "logo": "https://kvkdijitalcozumler.com/logos/KvK-Digital-Logo-Primary-Transparent.webp",
                  "image": "https://kvkdijitalcozumler.com/logos/KvK-Digital-Logo-Primary-Transparent.webp",
                  "telephone": "+905348914905",
                  "email": "iletisim@kvkdijitalcozumler.com",
                  "priceRange": "$$",
                  "description": "KVK Dijital Çözümler, İstanbul merkezli kurumsal web tasarım, e-ticaret altyapısı, özel yazılım ve SEO hizmetleri sunan dijital ajanstır.",
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
                    "@id": "https://kvkdijitalcozumler.com/#founder",
                    "name": "Ali Haydar Kavak",
                    "jobTitle": "Kurucu & Web Tasarımcı",
                    "url": "https://kvkdijitalcozumler.com/hakkimizda",
                    "worksFor": {
                      "@id": "https://kvkdijitalcozumler.com/#organization"
                    }
                  },
                  "sameAs": [
                    "https://www.instagram.com/kvkdijitalcozumler/",
                    "https://www.linkedin.com/company/kvk-dijital-%C3%A7%C3%B6z%C3%BCmler/",
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
