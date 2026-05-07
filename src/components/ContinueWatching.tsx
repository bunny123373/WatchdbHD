"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Film, Tv, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProgressItem {
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
  progress: number;
  duration: number;
  seasonNumber?: number;
  episodeNumber?: number;
}

export default function ContinueWatching() {
  const { user, token } = useAuth();
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProgress();
  }, [token]);

  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/progress", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.slice(0, 10));
      }
    } catch (e) {
      console.error("Failed to fetch progress:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || items.length === 0 || !user) return null;

  return (
    <section className="py-4">
      <div className="px-4 md:px-6 lg:px-8">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500" />
          Continue Watching
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0">
          {items.map((item) => {
            const c = item.contentId;
            return (
              <Link
                key={item._id}
                href={
                  c.type === "movie"
                    ? `/watch/${c._id}`
                    : `/series/watch/${c._id}?season=${item.seasonNumber || 1}&episode=${item.episodeNumber || 1}`
                }
                className="flex-shrink-0 w-36 sm:w-40 group"
              >
                <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
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
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-700">
                    <div
                      className="h-full bg-red-600 transition-all"
                      style={{ width: `${Math.min(item.progress, 100)}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <p className="text-white text-sm mt-2 truncate">{c.title}</p>
                <p className="text-gray-500 text-xs">
                  {item.seasonNumber ? `S${item.seasonNumber}` : ""}
                  {item.episodeNumber ? ` E${item.episodeNumber}` : "Movie"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
