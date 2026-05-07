"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, Film, Tv, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface WatchlistItem {
  _id: string;
  contentId: {
    _id: string;
    title: string;
    poster: string;
    type: string;
    slug?: string;
    year?: string;
    rating?: number;
  };
  createdAt: string;
}

export default function WatchlistPage() {
  const { user, token } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchWatchlist();
  }, [token]);

  const fetchWatchlist = async () => {
    try {
      const res = await fetch("/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch watchlist:", e);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (contentId: string) => {
    setRemovingId(contentId);
    try {
      await fetch(`/api/watchlist?contentId=${contentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((i) => String(i.contentId._id) !== contentId));
    } catch (e) {
      console.error("Failed to remove:", e);
    } finally {
      setRemovingId(null);
    }
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
        <p className="text-gray-400 text-sm mb-6">Sign in to save and manage your watchlist</p>
        <Link href="/" className="text-[#e50914] hover:underline text-sm">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-24 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Your watchlist is empty</p>
          <Link href="/" className="text-[#e50914] hover:underline">
            Browse movies and shows
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => {
            const c = item.contentId;
            return (
              <div key={item._id} className="relative group">
                <Link
                  href={c.type === "movie" ? `/movie/${c._id}` : `/series/${c._id}`}
                >
                  <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden">
                    {c.poster ? (
                      <img src={c.poster} alt={c.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {c.type === "movie" ? (
                          <Film className="w-10 h-10 text-zinc-600" />
                        ) : (
                          <Tv className="w-10 h-10 text-zinc-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{c.title}</p>
                  <p className="text-gray-500 text-xs">{c.year}</p>
                </Link>
                <button
                  onClick={() => removeFromWatchlist(String(c._id))}
                  disabled={removingId === String(c._id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  {removingId === String(c._id) ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <X className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
