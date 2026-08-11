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
};

export default nextConfig;
