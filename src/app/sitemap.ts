import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kvkdigital.com';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }
    // İleride dinamik sayfalar (örn. /projects/[slug]) eklenirse
    // veritabanından projeler çekilip buraya eklenecek.
  ];
}
