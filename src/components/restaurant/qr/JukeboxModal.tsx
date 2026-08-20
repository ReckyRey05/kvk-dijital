"use client";

import { useState } from "react";
import { X, Music2, ThumbsUp, Plus, Sparkles, Radio } from "lucide-react";
import { useRestaurantStore } from "@/lib/restaurant/store";

interface JukeboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: string;
}

export default function JukeboxModal({
  isOpen,
  onClose,
  tableNumber,
}: JukeboxModalProps) {
  const { songRequests, addSongRequest, voteSong } = useRestaurantStore();
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim()) return;

    addSongRequest({
      id: `song_${Date.now()}`,
      tableNumber,
      songTitle: songTitle.trim(),
      artist: artist.trim() || "Bilinmeyen Sanatçı",
      votes: 1,
      createdAt: new Date().toISOString(),
    });

    setSongTitle("");
    setArtist("");
    setShowAddForm(false);
  };

  const handleVote = (id: string) => {
    if (votedIds.has(id)) return;
    voteSong(id);
    setVotedIds((prev) => new Set(prev).add(id));
  };

  const sortedSongs = [...songRequests].sort((a, b) => b.votes - a.votes);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0c1212] border border-purple-500/40 rounded-t-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl animate-fade-in-up max-h-[92vh] overflow-y-auto sleek-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-extrabold border border-purple-500/30">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Dijital Müzik Kutusu</h3>
              <p className="text-xs text-foreground/50">{tableNumber} • Şarkı İste & Oyla</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Playing Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-400 animate-ping" />
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-300 block">Şu An Çalıyor</span>
              <span className="text-xs font-black text-white">Aura Lounge Spotify Playlist</span>
            </div>
          </div>
          <Radio className="w-5 h-5 text-purple-300 animate-pulse" />
        </div>

        {/* Song Queue */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          <span className="text-[11px] font-bold text-foreground/50 uppercase block">Sıradaki Şarkı Listesi</span>
          {sortedSongs.map((song, index) => (
            <div
              key={song.id}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-black text-purple-400 w-4">#{index + 1}</span>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-white truncate">{song.songTitle}</h5>
                  <p className="text-[10px] text-foreground/50 truncate">{song.artist} • {song.tableNumber}</p>
                </div>
              </div>

              <button
                onClick={() => handleVote(song.id)}
                disabled={votedIds.has(song.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  votedIds.has(song.id)
                    ? "bg-purple-500 text-white"
                    : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30"
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{song.votes}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add Song Form / Toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Şarkı İsteğinde Bulun</span>
          </button>
        ) : (
          <form onSubmit={handleAddSong} className="space-y-3 animate-fade-in pt-2 border-t border-white/10">
            <div>
              <input
                type="text"
                placeholder="Şarkı Adı (Örn: Bohemian Rhapsody)"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full bg-black/60 border border-purple-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                autoFocus
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Sanatçı / Grup (Örn: Queen)"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-purple-500 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-purple-400 transition-colors cursor-pointer"
              >
                <span>İsteği Gönder</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/15 transition-colors cursor-pointer"
              >
                <span>İptal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
