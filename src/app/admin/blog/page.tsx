"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import Link from "next/link";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { BlogPost } from "@/types/blog";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "blog_posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogPost[];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu makaleyi silmek istediğinize emin misiniz?")) return;
    
    try {
      await deleteDoc(doc(db, "blog_posts", id));
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Silinirken bir hata oluştu.");
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      // Optimistic update
      setPosts(posts.map(p => p.id === id ? { ...p, isPublished: newStatus } : p));
      
      import("firebase/firestore").then(async ({ updateDoc, doc }) => {
        await updateDoc(doc(db, "blog_posts", id), {
          isPublished: newStatus
        });
      });
    } catch (error) {
      console.error("Error toggling publish status:", error);
      alert("Durum güncellenirken bir hata oluştu.");
      fetchPosts(); // revert on error
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Yükleniyor...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Blog Yönetimi</h1>
          <p className="text-gray-400">Tüm makale ve blog yazılarınızı buradan yönetebilirsiniz.</p>
        </div>
        <Link 
          href="/admin/blog/new"
          className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Makale Ekle
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-gray-400 text-sm">
            <tr>
              <th className="p-4 font-medium">Makale Başlığı</th>
              <th className="p-4 font-medium">Durum</th>
              <th className="p-4 font-medium">Tarih</th>
              <th className="p-4 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  Henüz makale bulunmuyor.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-white mb-1">{post.title}</div>
                    <div className="text-xs text-gray-500">/{post.slug}</div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => post.id && handleTogglePublish(post.id, post.isPublished)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                        post.isPublished ? 'bg-accent' : 'bg-white/10'
                      }`}
                      title={post.isPublished ? "Yayından Kaldır" : "Yayına Al"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          post.isPublished ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-3 text-xs text-gray-400 font-medium">
                      {post.isPublished ? "Yayında" : "Taslak"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString('tr-TR') : "-"}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/blog/${post.slug.replace(/^\/?(blog\/)?/i, "").replace(/^\/+/, "")}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Görüntüle"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => post.id && handleDelete(post.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
