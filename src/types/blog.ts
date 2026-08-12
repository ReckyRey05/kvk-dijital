export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string; // HTML content
  excerpt: string;
  coverImage?: string;
  createdAt: any; // Firestore Timestamp
  isPublished: boolean;
}
