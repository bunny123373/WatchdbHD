"use client";

import { useState, useEffect } from "react";
import { IContent } from "@/models/Content";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { ArrowUpDown, Star, Clock, Flame } from "lucide-react";

type SortOption = "latest" | "top-rated" | "popular" | "a-z";

export default function MoviesClient() {
  const [movies, setMovies] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch("/api/content?type=movie&limit=100");
      const data = await res.json();
      if (data.success) {
        setMovies(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch movies:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortedMovies = [...movies].sort((a, b) => {
    switch (sortBy) {
      case "top-rated":
        return (b.rating || 0) - (a.rating || 0);
      case "popular":
        return (b.views || 0) - (a.views || 0);
      case "a-z":
        return a.title.localeCompare(b.title);
      case "latest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
    { value: "latest", label: "Latest", icon: <Clock className="w-4 h-4" /> },
    { value: "top-rated", label: "Top Rated", icon: <Star className="w-4 h-4" /> },
    { value: "popular", label: "Popular", icon: <Flame className="w-4 h-4" /> },
    { value: "a-z", label: "A-Z", icon: <ArrowUpDown className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Movies</h1>
            
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    sortBy === option.value
                      ? "bg-white text-black"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ContentGrid title="" items={sortedMovies} isNetflixStyle />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
