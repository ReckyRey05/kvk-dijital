"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { FolderKanban, Layers, MessageSquare, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    services: 0,
    messages: 0,
    newMessages: 0
  });
  
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [projectsSnap, servicesSnap, messagesSnap] = await Promise.all([
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "services")),
          getDocs(collection(db, "contactMessages"))
        ]);

        const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        setStats({
          projects: projectsSnap.size,
          services: servicesSnap.size,
          messages: messages.length,
          newMessages: messages.filter(m => m.status === "new").length
        });

        // Get 5 most recent messages
        const recentMessagesQuery = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"), limit(5));
        const recentSnap = await getDocs(recentMessagesQuery);
        setRecentMessages(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse">İstatistikler yükleniyor...</div>;
  }

  const statCards = [
    { name: "Toplam Proje", value: stats.projects, icon: FolderKanban, color: "text-blue-400" },
    { name: "Toplam Hizmet", value: stats.services, icon: Layers, color: "text-purple-400" },
    { name: "Yeni Mesajlar", value: stats.newMessages, icon: MessageSquare, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-foreground/60">Sitenizin genel durumu ve özet bilgileri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-6">
            <div className={`p-4 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon size={32} />
            </div>
            <div>
              <div className="text-4xl font-semibold">{stat.value}</div>
              <div className="text-foreground/60 text-sm mt-1">{stat.name}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-medium flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Son Mesajlar
          </h2>
          <Link href="/admin/messages" className="text-sm text-accent hover:underline">
            Tümünü Gör
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {recentMessages.length === 0 ? (
            <div className="p-8 text-center text-foreground/50">Henüz mesaj bulunmuyor.</div>
          ) : (
            recentMessages.map((msg) => (
              <div key={msg.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div>
                  <div className="font-medium">{msg.name}</div>
                  <div className="text-sm text-foreground/60">{msg.email}</div>
                  <div className="text-sm mt-2 line-clamp-1 text-foreground/80">{msg.message}</div>
                </div>
                <div className="flex items-center gap-3">
                  {msg.status === "new" && (
                    <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">Yeni</span>
                  )}
                  {msg.status === "contacted" && (
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">İletişime Geçildi</span>
                  )}
                  {msg.status === "completed" && (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">Tamamlandı</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
