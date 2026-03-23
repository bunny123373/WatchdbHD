"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Clock, ChevronRight } from "lucide-react";
import { IContent } from "@/models/Content";

interface ContinueWatchingItem {
  contentId: string;
  progress: number;
  timestamp: number;
  content: IContent;
}

interface MovieRecommendationsProps {
  currentContent: IContent;
  onContentSelect?: (content: IContent) => void;
}

const STORAGE_KEY = "watchProgressFull";

export default function MovieRecommendations({ currentContent, onContentSelect }: MovieRecommendationsProps) {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [recommendations, setRecommendations] = useState<IContent[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const progressData: ContinueWatchingItem[] = JSON.parse(saved);
      const filtered = progressData.filter(
        (item) => item.contentId !== String(currentContent._id) && item.progress < 95
      );
      filtered.sort((a, b) => b.timestamp - a.timestamp);
      setContinueWatching(filtered.slice(0, 6));
    }
  }, [currentContent._id]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const params = new URLSearchParams({
          limit: "10",
          language: currentContent.language || "",
          category: currentContent.category || "",
          exclude: String(currentContent._id)
        });
        const response = await fetch(`/api/content/recommendations?${params}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.contents || []);
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      }
    };
    fetchRecommendations();
  }, [currentContent._id, currentContent.language, currentContent.category]);

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-8 mt-8">
      {continueWatching.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#e50914]" />
              Continue Watching
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {continueWatching.map((item) => (
              <Link
                key={item.contentId}
                href={`/watch/${item.content._id}`}
                className="flex-shrink-0 w-36 sm:w-40 group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                  {item.content.poster ? (
                    <img
                      src={item.content.poster}
                      alt={item.content.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-[#e50914]"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/80 truncate font-medium">{item.content.title}</p>
                <p className="text-xs text-white/50">{Math.round(item.progress)}% watched</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">More Like This</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {recommendations.map((movie) => (
              <Link
                key={movie._id}
                href={`/watch/${movie._id}`}
                className="flex-shrink-0 w-36 sm:w-40 group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1a1a1a] mb-2">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/30" />
                    </div>
                  )}
                  {movie.quality && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#e50914] text-white text-[10px] font-bold rounded">
                      {movie.quality}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="w-6 h-6 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-white/80 truncate font-medium">{movie.title}</p>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  {movie.year && <span>{movie.year}</span>}
                  {movie.language && <span>• {movie.language}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {continueWatching.length === 0 && recommendations.length === 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Popular in {currentContent.language || "Telugu"}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-36 sm:w-40">
                <div className="aspect-[2/3] rounded-lg bg-[#1a1a1a] mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-[#1a1a1a] rounded mb-1 animate-pulse" />
                <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}