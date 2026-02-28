"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IContent } from "@/models/Content";
import { Play, X, Film, Tv, Clock } from "lucide-react";

export default function WatchHistoryPage() {
  const [history, setHistory] = useState<{content: IContent, watchedAt: number, progress: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("watchHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const removeFromHistory = (contentId: string) => {
    const newHistory = history.filter((h) => String(h.content._id) !== contentId);
    setHistory(newHistory);
    localStorage.setItem("watchHistory", JSON.stringify(newHistory));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem("watchHistory");
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
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
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-24 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Watch History</h1>
        {history.length > 0 && (
          <button
            onClick={clearAllHistory}
            className="text-gray-400 text-sm hover:text-white"
          >
            Clear all
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No watch history yet</p>
          <Link href="/" className="text-[#e50914] hover:underline">
            Start watching
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={String(item.content._id)} className="flex gap-4 bg-zinc-900/50 p-3 rounded-lg">
              <Link
                href={item.content.type === "movie" ? `/movie/${item.content._id}` : `/series/${item.content._id}`}
                className="flex-shrink-0"
              >
                <div className="w-24 sm:w-28 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden">
                  {item.content.poster ? (
                    <img
                      src={item.content.poster}
                      alt={item.content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.content.type === "movie" ? (
                        <Film className="w-8 h-8 text-zinc-600" />
                      ) : (
                        <Tv className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={item.content.type === "movie" ? `/movie/${item.content._id}` : `/series/${item.content._id}`}>
                  <h3 className="text-white font-medium truncate">{item.content.title}</h3>
                </Link>
                <p className="text-gray-500 text-sm">
                  {item.content.type === "movie" ? "Movie" : "Series"} • {item.content.year}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {formatTime(item.watchedAt)}
                </p>
                {item.progress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div
                        className="bg-red-600 h-1.5 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">{item.progress}% watched</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => removeFromHistory(String(item.content._id))}
                className="text-gray-500 hover:text-white self-start"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
