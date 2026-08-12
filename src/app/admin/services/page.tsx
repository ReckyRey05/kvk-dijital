"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";
import { Trash2, Plus, Layers } from "lucide-react";

export default function ServicesAdmin() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newService, setNewService] = useState({ title: "", description: "", features: "", link: "" });

  const fetchServices = async () => {
    try {
      const snap = await getDocs(collection(db, "services"));
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Bu hizmeti silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "services", id));
      fetchServices();
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title || !newService.description) return;

    try {
      await addDoc(collection(db, "services"), {
        title: newService.title,
        description: newService.description,
        features: newService.features ? newService.features.split(",").map(f => f.trim()) : [],
        link: newService.link,
        createdAt: serverTimestamp()
      });
      setNewService({ title: "", description: "", features: "", link: "" });
      setIsAdding(false);
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Hizmetler</h1>
          <p className="text-foreground/60">Ajansınızın sunduğu hizmetleri yönetin.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Yeni Hizmet
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddService} className="glass-panel p-6 rounded-2xl mb-8 flex flex-col gap-4 border border-accent/20">
          <h3 className="font-medium text-lg mb-2">Yeni Hizmet Ekle</h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Hizmet Adı</label>
            <input required type="text" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Kısa Açıklama</label>
            <textarea required rows={2} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none resize-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Özellikler (Virgülle Ayırın)</label>
            <input type="text" value={newService.features} onChange={e => setNewService({...newService, features: e.target.value})} placeholder="Örn: SEO Uyumlu, Mobil Uyumlu, Hızlı" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-foreground/60">Detay Sayfası Linki (Opsiyonel)</label>
            <input type="text" value={newService.link} onChange={e => setNewService({...newService, link: e.target.value})} placeholder="Örn: /kurumsal-web-tasarim" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-accent outline-none" />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">İptal</button>
            <button type="submit" className="px-6 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors">Kaydet</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center p-8 text-foreground/50">Yükleniyor...</div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center p-8 text-foreground/50 glass-panel rounded-2xl">Henüz hizmet eklenmemiş.</div>
        ) : (
          services.map(service => (
            <div key={service.id} className="glass-panel p-6 rounded-2xl flex flex-col justify-between h-full group">
              <div>
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-accent">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-medium mb-3">{service.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{service.description}</p>
              </div>
              
              <div className="mt-8 pt-4 border-t border-white/10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(service.id)} className="p-2 text-foreground/40 hover:text-red-400 transition-colors bg-white/5 hover:bg-white/10 rounded-xl">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
