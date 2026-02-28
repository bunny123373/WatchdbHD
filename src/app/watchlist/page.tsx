"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IContent } from "@/models/Content";
import { Play, X, Film, Tv } from "lucide-react";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const removeFromWatchlist = (contentId: string) => {
    const newWatchlist = watchlist.filter((f) => String(f._id) !== contentId);
    setWatchlist(newWatchlist);
    localStorage.setItem("watchlist", JSON.stringify(newWatchlist));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-24 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">My Watchlist</h1>
      
      {watchlist.length === 0 ? (
        <div className="text-center py-20">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Your watchlist is empty</p>
          <Link href="/" className="text-[#e50914] hover:underline">
            Browse movies and shows
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {watchlist.map((item) => (
            <div key={String(item._id)} className="relative group">
              <Link href={item.type === "movie" ? `/movie/${item._id}` : `/series/${item._id}`}>
                <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden">
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === "movie" ? (
                        <Film className="w-10 h-10 text-zinc-600" />
                      ) : (
                        <Tv className="w-10 h-10 text-zinc-600" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-white text-sm mt-2 truncate">{item.title}</p>
                <p className="text-gray-500 text-xs">{item.year}</p>
              </Link>
              <button
                onClick={() => removeFromWatchlist(String(item._id))}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
