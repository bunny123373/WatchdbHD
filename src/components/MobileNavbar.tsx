"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Film, Tv, Clock, TrendingUp, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "@/components/LanguageSelector";
import Logo from "@/components/Logo";

interface SearchResult {
  _id: string;
  title: string;
  poster: string;
  type: string;
  year: string;
}

const MENU_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "TV Shows", href: "/series" },
  { label: "New & Popular", href: "/all-series?sort=newest" },
  { label: "My List", href: "/my-list" },
];

export default function MobileNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isSearchActive || isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchActive, isMenuOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

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

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      saveSearch(searchInput.trim());
    }
  };

  const handleRecentClick = (term: string) => {
    setSearchInput(term);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  if (pathname.startsWith("/admin")) return null;

  if (isSearchActive) {
    return (
      <div ref={searchRef} className="fixed inset-0 z-[100] bg-[#141414] overflow-y-auto">
        <div className="sticky top-0 bg-[#141414] px-4 pt-4 pb-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeSearch}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 text-lg"
                autoFocus
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Results</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {searchResults.map((result) => (
                  <Link
                    key={result._id}
                    href={result.type === "movie" ? `/movie/${result._id}` : `/series/${result._id}`}
                    onClick={() => {
                      closeSearch();
                      saveSearch(result.title);
                    }}
                    className="group"
                  >
                    <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden relative">
                      {result.poster ? (
                        <img src={result.poster} alt={result.title} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {result.type === "movie" ? (
                            <Film className="w-8 h-8 text-zinc-600" />
                          ) : (
                            <Tv className="w-8 h-8 text-zinc-600" />
                          )}
                        </div>
                      )}
                      <div className="absolute top-1 right-1">
                        <span className="text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                          {result.type === "movie" ? "Movie" : "Series"}
                        </span>
                      </div>
                    </div>
                    <p className="text-white text-xs mt-2 truncate font-medium">{result.title}</p>
                    <p className="text-gray-500 text-[10px]">{result.year}</p>
                  </Link>
                ))}
              </div>
            </>
          ) : searchInput.length > 0 ? (
            <div className="text-center py-12">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No results found for "{searchInput}"</p>
              <p className="text-gray-500 text-sm mt-1">Try different keywords</p>
            </div>
          ) : recentSearches.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Recent Searches</span>
                </div>
                <button onClick={clearRecent} className="text-gray-500 text-xs hover:text-white">
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentClick(term)}
                    className="flex items-center gap-3 w-full p-3 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">{term}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Search for movies and TV shows</p>
              <p className="text-gray-500 text-sm mt-1">Find your favorite content</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 lg:hidden ${
        isScrolled ? "bg-[#141414]" : "bg-gradient-to-b from-black/95 to-transparent"
      }`}
    >
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1 p-1.5 -ml-1.5 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {isMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-xl overflow-hidden z-[70]">
                  <div className="py-2">
                    {MENU_ITEMS.map((item) => {
                      const isActive = item.href === "/" 
                        ? pathname === "/" 
                        : pathname.startsWith(item.href.split('?')[0]);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            isActive 
                              ? "bg-white/10 text-white" 
                              : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {item.label === "Movies" && <Film className="w-4 h-4" />}
                          {item.label === "TV Shows" && <Tv className="w-4 h-4" />}
                          {item.label === "Home" && (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                            </svg>
                          )}
                          {item.label === "New & Popular" && <TrendingUp className="w-4 h-4" />}
                          {item.label === "My List" && (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          )}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-800 py-2">
                    <Link
                      href="/collections"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"/>
                        <rect x="14" y="3" width="7" height="7"/>
                        <rect x="14" y="14" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                      </svg>
                      <span>Collections</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/" className="flex items-center gap-2">
              <Logo size="sm" className="w-6 h-6" />
              <span className="text-lg font-bold text-[#e50914]">
                WATCH<span className="text-white">TMDB</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-0.5">
            <LanguageSelector />
            <Link href="/request" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </Link>
            <button
              type="button"
              onClick={() => setIsSearchActive(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
