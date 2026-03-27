"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, X, Film, Tv, Download, HardDrive, Trash2 } from "lucide-react";
import { useDownloads, DownloadedItem } from "@/hooks/useDownloads";

export default function DownloadsPage() {
  const { downloads, removeDownload, clearAllDownloads, isLoaded } = useDownloads();
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "series">("all");

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredDownloads = selectedType === "all" 
    ? downloads 
    : downloads.filter(d => d.type === selectedType);

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-20 pb-24 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Downloads</h1>
        {downloads.length > 0 && (
          <button
            onClick={clearAllDownloads}
            className="text-gray-400 text-sm hover:text-white flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {downloads.length > 0 && (
        <div className="flex gap-2 mb-6">
          {(["all", "movie", "series"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedType === type
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-gray-400 hover:text-white"
              }`}
            >
              {type === "all" ? "All" : type === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>
      )}
      
      {downloads.length === 0 ? (
        <div className="text-center py-20">
          <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No downloads yet</p>
          <Link href="/" className="text-[#e50914] hover:underline">
            Browse content
          </Link>
        </div>
      ) : filteredDownloads.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">No {selectedType === "movie" ? "movies" : "series"} downloaded</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDownloads.map((item) => (
            <div key={item.id} className="flex gap-4 bg-zinc-900/50 p-3 rounded-lg">
              <Link
                href={item.type === "movie" ? `/movie/${item.id}` : `/series/${item.id}`}
                className="flex-shrink-0"
              >
                <div className="w-24 sm:w-28 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.type === "movie" ? (
                        <Film className="w-8 h-8 text-zinc-600" />
                      ) : (
                        <Tv className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-xs text-white font-medium">
                    {item.quality}
                  </div>
                </div>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={item.type === "movie" ? `/movie/${item.id}` : `/series/${item.id}`}>
                  <h3 className="text-white font-medium truncate">{item.title}</h3>
                </Link>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <span className="capitalize">{item.type}</span>
                  <span>•</span>
                  <span>{item.language}</span>
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{item.quality}</span>
                  {item.size && (
                    <>
                      <span>•</span>
                      <span>{formatSize(item.size)}</span>
                    </>
                  )}
                  {item.season && item.episode && (
                    <>
                      <span>•</span>
                      <span>S{item.season}E{item.episode}</span>
                    </>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Downloaded {formatDate(item.downloadedAt)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={item.type === "movie" ? `/watch/${item.id}` : `/series/watch/${item.id}`}
                  className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                >
                  <Play className="w-4 h-4 text-white" />
                </Link>
                <button
                  onClick={() => removeDownload(item.id)}
                  className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-zinc-900/50 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          Storage Info
        </h3>
        <p className="text-gray-400 text-sm">
          {downloads.length} item(s) downloaded • {formatSize(downloads.reduce((acc, d) => acc + (d.size || 0), 0))} used
        </p>
      </div>
    </div>
  );
}
