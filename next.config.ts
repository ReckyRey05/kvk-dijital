import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        destination: '/#contact', // There is no /iletisim route, so redirecting to homepage contact section
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' blob: data: https://firebasestorage.googleapis.com https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src 'self';",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
