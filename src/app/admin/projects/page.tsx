"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const snap = await getDocs(collection(db, "projects"));
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu projeyi silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "projects", id));
      fetchProjects();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Projeler</h1>
          <p className="text-foreground/60">Sitede sergilenen tüm projeleri yönetin.</p>
        </div>
        <Link 
          href="/admin/projects/new"
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Yeni Proje Ekle
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-foreground/60 text-sm">
              <th className="p-6 font-medium">Proje Adı</th>
              <th className="p-6 font-medium">Kategori</th>
              <th className="p-6 font-medium">Öne Çıkan</th>
              <th className="p-6 font-medium text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center text-foreground/50">Yükleniyor...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-foreground/50">Henüz proje eklenmemiş.</td></tr>
            ) : (
              projects.map(project => (
                <tr key={project.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-6 font-medium">{project.title}</td>
                  <td className="p-6 text-foreground/80">{project.category}</td>
                  <td className="p-6">
                    {project.isFeatured ? (
                      <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">Evet</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-white/10 text-foreground/60 text-xs font-medium">Hayır</span>
                    )}
                  </td>
                  <td className="p-6 flex items-center justify-end gap-3">
                    <Link href={`/admin/projects/${project.id}`} className="p-2 text-foreground/60 hover:text-white transition-colors">
                      <Edit2 size={18} />
                    </Link>
                    <button onClick={() => handleDelete(project.id)} className="p-2 text-foreground/60 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
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
