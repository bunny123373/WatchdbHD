"use client";

import { useState, useEffect } from "react";
import { Search, Film, Tv, Loader2, ChevronDown } from "lucide-react";

interface TMDBSearchResult {
  tmdbId: number;
  title: string;
  poster: string;
  banner: string;
  description: string;
  year: string;
  rating: number;
  genreIds?: number[];
  genres?: string[];
  originalLanguage?: string;
}

interface TMDBSearchProps {
  type: "movie" | "series";
  onSelect: (result: TMDBSearchResult) => void;
}

const LANGUAGES = [
  { code: "", label: "All Languages" },
  { code: "te", label: "Telugu" },
  { code: "hi", label: "Hindi" },
  { code: "ta", label: "Tamil" },
  { code: "ml", label: "Malayalam" },
  { code: "kn", label: "Kannada" },
  { code: "en", label: "English" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
];

const GENRES = [
  { id: "", name: "All Genres" },
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "35", name: "Comedy" },
  { id: "27", name: "Horror" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Sci-Fi" },
  { id: "53", name: "Thriller" },
  { id: "16", name: "Animation" },
  { id: "14", name: "Fantasy" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentary" },
  { id: "36", name: "History" },
  { id: "10402", name: "Music" },
  { id: "18", name: "Drama" },
  { id: "10770", name: "TV Movie" },
];

export default function TMDBSearch({ type, onSelect }: TMDBSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasApiKey, setHasApiKey] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const searchTMDB = async (searchQuery: string, language: string, genre: string) => {
    if (searchQuery.length < 2 && !language && !genre) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      let url = `/api/tmdb?type=${type}&filterExisting=false`;
      
      if (searchQuery.length >= 2) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      } else if (language) {
        url += `&action=bylanguage&language=${language}`;
      } else if (genre) {
        url += `&action=bygenre&genreId=${genre}`;
      } else {
        url += `&action=popular`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setResults(data.data || []);
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

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchTMDB(query, selectedLanguage, selectedGenre);
    }, 500);
    return () => clearTimeout(debounce);
  }, [query, selectedLanguage, selectedGenre]);

  const handleApplyFilters = () => {
    setShowFilters(false);
    searchTMDB(query, selectedLanguage, selectedGenre);
  };

  const handleReset = () => {
    setQuery("");
    setSelectedLanguage("");
    setSelectedGenre("");
    setResults([]);
  };

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
      <div className="flex gap-2">
        <div className="relative flex-1">
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
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-xl border transition-all flex items-center gap-2 ${
            showFilters || selectedLanguage || selectedGenre
              ? "bg-primary-gold text-black border-primary-gold"
              : "bg-background border-border text-text-primary hover:border-primary-gold"
          }`}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          Filters
        </button>
        {(selectedLanguage || selectedGenre) && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-border text-text-primary hover:border-red-500 hover:text-red-500 transition-all"
          >
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="p-4 bg-card border border-border rounded-xl space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary focus:outline-none focus:border-primary-gold"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary focus:outline-none focus:border-primary-gold"
              >
                {GENRES.map((genre) => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-primary-gold text-black rounded-lg font-medium hover:bg-primary-gold/80 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {(selectedLanguage || selectedGenre) && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguage && (
            <span className="px-2 py-1 bg-primary-gold/20 text-primary-gold text-xs rounded-full">
              Language: {LANGUAGES.find(l => l.code === selectedLanguage)?.label}
            </span>
          )}
          {selectedGenre && (
            <span className="px-2 py-1 bg-primary-gold/20 text-primary-gold text-xs rounded-full">
              Genre: {GENRES.find(g => g.id === selectedGenre)?.name}
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-1">
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
              {result.genres && result.genres.length > 0 && (
                <p className="text-[10px] text-text-muted mt-1 line-clamp-1">{result.genres.slice(0, 2).join(", ")}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && !error && (query || selectedLanguage || selectedGenre) && (
        <p className="text-text-muted text-sm text-center py-4">No results found. Try different filters.</p>
      )}
    </div>
  );
}
