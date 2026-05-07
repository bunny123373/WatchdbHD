"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, Film, Tv, Clock, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HistoryItem {
  _id: string;
  contentId: {
    _id: string;
    title: string;
    poster: string;
    type: string;
    year?: string;
  };
  progress: number;
  duration: number;
  updatedAt: string;
}

export default function WatchHistoryPage() {
  const { user, token } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch history:", e);
    } finally {
      setLoading(false);
    }
  };

  const removeFromHistory = async (contentId: string) => {
    try {
      await fetch(`/api/progress?contentId=${contentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((h) => String(h.contentId._id) !== contentId));
    } catch (e) {
      console.error("Failed to remove:", e);
    }
  };

  const clearAllHistory = async () => {
    for (const item of items) {
      await removeFromHistory(String(item.contentId._id));
    }
    setItems([]);
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#141414] pt-20 pb-24 px-4 flex flex-col items-center justify-center">
        <LogIn className="w-12 h-12 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
        <p className="text-gray-400 text-sm mb-6">Sign in to see your watch history</p>
        <Link href="/" className="text-[#e50914] hover:underline text-sm">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-24 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Watch History</h1>
        {items.length > 0 && (
          <button onClick={clearAllHistory} className="text-gray-400 text-sm hover:text-white">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No watch history yet</p>
          <Link href="/" className="text-[#e50914] hover:underline">Start watching</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const c = item.contentId;
            return (
              <div key={item._id} className="flex gap-4 bg-zinc-900/50 p-3 rounded-lg">
                <Link
                  href={c.type === "movie" ? `/movie/${c._id}` : `/series/${c._id}`}
                  className="flex-shrink-0"
                >
                  <div className="w-24 sm:w-28 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden">
                    {c.poster ? (
                      <img src={c.poster} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {c.type === "movie" ? (
                          <Film className="w-8 h-8 text-zinc-600" />
                        ) : (
                          <Tv className="w-8 h-8 text-zinc-600" />
                        )}
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={c.type === "movie" ? `/movie/${c._id}` : `/series/${c._id}`}>
                    <h3 className="text-white font-medium truncate">{c.title}</h3>
                  </Link>
                  <p className="text-gray-500 text-sm">
                    {c.type === "movie" ? "Movie" : "Series"} • {c.year}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">{formatTime(item.updatedAt)}</p>
                  {item.progress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-zinc-700 rounded-full h-1.5">
                        <div
                          className="bg-red-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(item.progress, 100)}%` }}
                        />
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{Math.round(item.progress)}% watched</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFromHistory(String(c._id))}
                  className="text-gray-500 hover:text-white self-start"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
