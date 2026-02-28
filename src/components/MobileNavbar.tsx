"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Film, Tv } from "lucide-react";

interface SearchResult {
  _id: string;
  title: string;
  poster: string;
  type: string;
  year: string;
}

export default function MobileNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    };
    if (isSearchActive) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchActive]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchInput.length < 1) {
        setSearchResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/content?search=${encodeURIComponent(searchInput)}&limit=20`);
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchSearchResults, 200);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchInput("");
    setSearchResults([]);
  };

  if (pathname.startsWith("/admin")) return null;

  if (isSearchActive) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#141414] overflow-y-auto">
        <div className="px-4 pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={closeSearch}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Titles, people, genres"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 text-lg"
                autoFocus
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((result) => (
                <Link
                  key={result._id}
                  href={result.type === "movie" ? `/movie/${result._id}` : `/series/${result._id}`}
                  onClick={closeSearch}
                  className="group"
                >
                  <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
                    {result.poster ? (
                      <img src={result.poster} alt={result.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {result.type === "movie" ? (
                          <Film className="w-10 h-10 text-zinc-600" />
                        ) : (
                          <Tv className="w-10 h-10 text-zinc-600" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-white text-sm mt-2 truncate">{result.title}</p>
                  <p className="text-gray-500 text-xs">{result.year}</p>
                </Link>
              ))}
            </div>
          ) : searchInput.length > 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No results found for "{searchInput}"</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Search for movies and TV shows</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 lg:hidden ${
        isScrolled ? "bg-[#141414]" : "bg-gradient-to-b from-black/90 to-transparent"
      }`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-[#e50914]">
              WATCH<span className="text-white">TMDB</span>
            </span>
          </Link>

          <button
            onClick={() => setIsSearchActive(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </nav>
  );
}
