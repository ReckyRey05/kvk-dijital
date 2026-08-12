import { MetadataRoute } from 'next';
import { getAdminDb } from "@/lib/firebase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kvkdijitalcozumler.com';

  // Fetch dynamic blog posts for sitemap via Admin SDK
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("blog_posts").where("isPublished", "==", true).get();
    blogUrls = snapshot.docs.map(doc => {
      const data = doc.data();
      const rawSlug = data.slug || "";
      const cleanSlug = rawSlug.replace(/^\/?(blog\/)?/i, "").replace(/^\/+/, "");
      return {
        url: `${baseUrl}/blog/${cleanSlug}`,
        lastModified: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });
  } catch {
    blogUrls = [];
  }

  // Only include public indexable pages (exclude noindex legal/private pages)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hizmetler`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projeler`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/web-tasarim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/istanbul-web-tasarim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kurumsal-web-tasarim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/e-ticaret-web-sitesi`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ozel-yazilim`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }
  ];

  return [...staticRoutes, ...blogUrls];
}
