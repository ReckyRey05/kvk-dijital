"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { Mail, Trash2, CheckCircle, Clock } from "lucide-react";

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const snap = await getDocs(collection(db, "contactMessages"));
      // Sort in frontend for simplicity or fetch sorted
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      msgs.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "contactMessages", id));
      fetchMessages();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "contactMessages", id), { status: newStatus });
    fetchMessages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Mesajlar</h1>
          <p className="text-foreground/60">Gelen iletişim formu mesajlarını yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center p-8 text-foreground/50 glass-panel rounded-2xl">Yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="text-center p-8 text-foreground/50 glass-panel rounded-2xl">Henüz mesaj bulunmuyor.</div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-full bg-white/5 mt-1">
                  <Mail size={24} className="text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{msg.name}</h3>
                    <a href={`mailto:${msg.email}`} className="text-sm text-foreground/60 hover:text-accent transition-colors">{msg.email}</a>
                  </div>
                  {msg.phone && <div className="text-sm text-foreground/50 mb-3">{msg.phone}</div>}
                  <p className="text-foreground/80 leading-relaxed bg-white/5 p-4 rounded-xl">{msg.message}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <select 
                    value={msg.status} 
                    onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                    className={`text-sm font-medium px-3 py-2 rounded-xl border outline-none cursor-pointer
                      ${msg.status === 'new' ? 'bg-accent/10 border-accent/30 text-accent' : 
                        msg.status === 'contacted' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 
                        'bg-green-500/10 border-green-500/30 text-green-400'}`}
                  >
                    <option value="new" className="bg-background text-foreground">Yeni</option>
                    <option value="contacted" className="bg-background text-foreground">İletişime Geçildi</option>
                    <option value="completed" className="bg-background text-foreground">Tamamlandı</option>
                  </select>
                  <button onClick={() => handleDelete(msg.id)} className="p-2 text-foreground/40 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
