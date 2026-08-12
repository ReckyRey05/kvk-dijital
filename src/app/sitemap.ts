import { MetadataRoute } from 'next';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kvkdijitalcozumler.com';

  // Fetch dynamic blog posts for sitemap
  const postsRef = collection(db, "blog_posts");
  const postsQuery = query(postsRef, where("isPublished", "==", true));
  const snapshot = await getDocs(postsQuery).catch(() => null);
  
  const blogUrls = snapshot ? snapshot.docs.map(doc => ({
    url: `${baseUrl}/blog/${doc.data().slug}`,
    lastModified: doc.data().createdAt?.toDate ? new Date(doc.data().createdAt.toDate()) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) : [];

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
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
      url: `${baseUrl}/kvkk`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
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
    }
  ];
  
  return [...staticRoutes, ...blogUrls];
}
