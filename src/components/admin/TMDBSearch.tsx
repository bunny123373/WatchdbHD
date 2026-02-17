"use client";

import { useState, useEffect } from "react";
import { Search, Film, Tv, Loader2 } from "lucide-react";

interface TMDBSearchResult {
  tmdbId: number;
  title: string;
  poster: string;
  banner: string;
  description: string;
  year: string;
  rating: number;
}

interface TMDBSearchProps {
  type: "movie" | "series";
  onSelect: (result: TMDBSearchResult) => void;
}

export default function TMDBSearch({ type, onSelect }: TMDBSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    const searchTMDB = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/tmdb?query=${encodeURIComponent(query)}&type=${type}`);
        const data = await response.json();

        if (data.success) {
          setResults(data.data);
        } else {
          if (data.error?.includes("not configured")) {
            setHasApiKey(false);
          }
          setError(data.error || "Search failed");
          setResults([]);
        }
      } catch {
        setError("Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchTMDB, 500);
    return () => clearTimeout(debounce);
  }, [query, type]);

  if (!hasApiKey) {
    return (
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <p className="text-yellow-500 text-sm">
          ⚠️ TMDB API key not configured. Add TMDB_API_KEY in .env.local to enable auto-fill.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${type === "movie" ? "movies" : "series"} on TMDB...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary-gold"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted animate-spin" />
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-1">
          {results.map((result) => (
            <button
              key={result.tmdbId}
              type="button"
              onClick={() => onSelect(result)}
              className="text-left p-2 rounded-xl bg-card border border-border hover:border-primary-gold/50 transition-all"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                {result.poster ? (
                  <img
                    src={result.poster}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-border flex items-center justify-center">
                    {type === "movie" ? (
                      <Film className="w-8 h-8 text-text-muted" />
                    ) : (
                      <Tv className="w-8 h-8 text-text-muted" />
                    )}
                  </div>
                )}
              </div>
              <h4 className="font-medium text-text-primary text-sm line-clamp-1">{result.title}</h4>
              <p className="text-xs text-text-muted">{result.year}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
