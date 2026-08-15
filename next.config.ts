import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modern image formats: AVIF (best) → WebP (fallback)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },

  // Gereksiz polyfill'leri kaldırmak için modern tarayıcı transpile hedefi
  // Array.prototype.at, Object.fromEntries, String.prototype.trimEnd gibi polyfill'ler ~14KB kurtarır
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  async redirects() {
    return [
      {
        source: '/hakkimda',
        destination: '/hakkimizda',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/hakkimizda',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/hizmetler',
        permanent: true,
      },
      {
        source: '/projects',
        destination: '/projeler',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/iletisim',
        permanent: true,
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' blob: data: https://firebasestorage.googleapis.com https://www.googletagmanager.com https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googletagmanager.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self';",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
