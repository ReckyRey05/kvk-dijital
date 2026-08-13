import { getAdminDb } from "@/lib/firebase/admin";
import { initialBlogPosts, ExtendedBlogPost } from "@/data/initialBlogPosts";

/**
 * Normalizes slug string by stripping leading slashes or blog prefixes
 */
export function cleanSlug(rawSlug: string): string {
  return rawSlug.replace(/^\/?(blog\/)?/i, "").replace(/^\/+/, "");
}

/**
 * Retrieves all published blog posts combining static initial posts and Firestore posts
 */
export async function getAllBlogPosts(): Promise<ExtendedBlogPost[]> {
  let firestorePosts: ExtendedBlogPost[] = [];
  
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("blog_posts")
      .where("isPublished", "==", true)
      .orderBy("createdAt", "desc")
      .get();
      
    if (snapshot && !snapshot.empty) {
      firestorePosts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          slug: cleanSlug(data.slug || ""),
          content: data.content || "",
          excerpt: data.excerpt || "",
          coverImage: data.coverImage,
          category: data.category || "Genel",
          readTime: data.readTime || "5 dk okunma",
          author: data.author || "KvK Dijital Çözümler Uzman Kadrosu",
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt ? { toDate: () => data.createdAt.toDate() } : { toDate: () => new Date() }
        };
      });
    }
  } catch {
    firestorePosts = [];
  }

  // Merge static initial posts with any Firestore posts (avoiding duplicate slugs)
  const firestoreSlugs = new Set(firestorePosts.map(p => p.slug));
  const uniqueInitialPosts = initialBlogPosts.filter(p => !firestoreSlugs.has(cleanSlug(p.slug)));

  return [...firestorePosts, ...uniqueInitialPosts];
}

/**
 * Retrieves a single published blog post by clean slug
 */
export async function getBlogPostBySlug(slug: string): Promise<ExtendedBlogPost | null> {
  const targetSlug = cleanSlug(slug);
  
  // 1. Check initial static posts
  const staticMatch = initialBlogPosts.find(p => cleanSlug(p.slug) === targetSlug);
  if (staticMatch) {
    return staticMatch;
  }

  // 2. Fallback to Firestore query
  try {
    const db = getAdminDb();
    const postsRef = db.collection("blog_posts");
    
    let snapshot = await postsRef.where("slug", "==", targetSlug).limit(1).get().catch(() => null);
    if (!snapshot || snapshot.empty) {
      snapshot = await postsRef.where("slug", "==", `/${targetSlug}`).limit(1).get().catch(() => null);
    }
    if (!snapshot || snapshot.empty) {
      snapshot = await postsRef.where("slug", "==", `/blog/${targetSlug}`).limit(1).get().catch(() => null);
    }

    if (snapshot && !snapshot.empty) {
      const doc = snapshot.docs[0];
      const data = doc.data();
      if (data.isPublished === false) return null;

      return {
        id: doc.id,
        title: data.title,
        slug: cleanSlug(data.slug || targetSlug),
        content: data.content || "",
        excerpt: data.excerpt || "",
        coverImage: data.coverImage,
        category: data.category || "Genel",
        readTime: data.readTime || "5 dk okunma",
        author: data.author || "KvK Dijital Çözümler Uzman Kadrosu",
        isPublished: true,
        createdAt: data.createdAt ? { toDate: () => data.createdAt.toDate() } : { toDate: () => new Date() }
      };
    }
  } catch {
    return null;
  }

  return null;
}
