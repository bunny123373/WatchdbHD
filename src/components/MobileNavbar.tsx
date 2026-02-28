"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useAppDispatch } from "@/redux/hooks";
import { setSearch } from "@/redux/slices/uiSlice";

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
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchInput.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const response = await fetch(`/api/content?search=${encodeURIComponent(searchInput)}&limit=8`);
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    };
    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch(setSearch(searchInput.trim()));
      setIsSearchActive(false);
      router.push("/");
    }
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 lg:hidden ${
        isScrolled || isSearchActive ? "bg-[#141414]" : "bg-gradient-to-b from-black/90 to-transparent"
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
            onClick={() => setIsSearchActive(!isSearchActive)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {isSearchActive && (
          <div className="mt-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search movies, TV shows..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                autoFocus
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </form>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mx-4 bg-[#1a1a1a] border border-zinc-800 rounded-lg mt-2 max-h-80 overflow-y-auto z-50">
                {searchResults.map((result) => (
                  <Link
                    key={result._id}
                    href={result.type === "movie" ? `/movie/${result._id}` : `/series/${result._id}`}
                    onClick={() => {
                      setIsSearchActive(false);
                      setSearchInput("");
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-white/10"
                  >
                    <div className="w-10 h-14 bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                      {result.poster && (
                        <img src={result.poster} alt={result.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{result.title}</p>
                      <p className="text-gray-400 text-sm">{result.year} • {result.type}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
