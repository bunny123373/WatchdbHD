"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, X, Film, Tv, Home, Loader2, MessageSquare } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSearch, setTypeFilter } from "@/redux/slices/uiSlice";
import { cn } from "@/utils/cn";
import { IContent } from "@/models/Content";
import LanguageSelector from "@/components/LanguageSelector";

interface SearchResult {
  _id: string;
  title: string;
  poster: string;
  type: string;
  year: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { search, typeFilter } = useAppSelector((state) => state.ui);
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = pathname.startsWith("/admin");
  const isHomePage = pathname === "/";
  if (isAdminRoute) return null;

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
        if (!searchInput) {
          setSearchInput("");
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchInput]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch(setSearch(searchInput.trim()));
      setIsSearchActive(false);
      setSearchResults([]);
      router.push("/");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    dispatch(setSearch(""));
    setSearchResults([]);
  };

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchInput.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setSearching(true);
      try {
        const response = await fetch(`/api/content?search=${encodeURIComponent(searchInput)}&limit=8`);
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  const navLinks = [
    { href: "/", label: "Home", type: "all" },
    { href: "/all-series", label: "TV Shows", type: "series" },
    { href: "/movies", label: "Movies", type: "movie" },
    { href: "/collections", label: "Collections", type: "collections" },
    { href: "/request", label: "Request", type: "request" },
  ];

  const handleTypeFilter = (type: string) => {
    if (type === "request") return;
    dispatch(setTypeFilter(type as "all" | "movie" | "series"));
    router.push(type === "all" ? "/" : `/?type=${type}`);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 hidden lg:block",
        isScrolled || isSearchActive ? "bg-[#141414]" : "bg-gradient-to-b from-black/90 to-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Left - Logo & Nav Links */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#e50914]">
                WATCH<span className="text-white">TMDB</span>
              </span>
            </Link>

            {/* Back to Home Button */}
            {!isHomePage && (
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#e50914] hover:bg-[#b2070f] rounded text-white text-xs sm:text-sm font-medium transition-colors"
              >
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Home</span>
              </Link>
            )}

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs sm:text-sm transition-colors hover:text-white",
                    pathname === link.href || (pathname === "/" && link.type === "all")
                      ? "text-white font-medium"
                      : "text-gray-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right - Search, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Search - Netflix Style */}
            <div ref={searchRef} className="relative">
              <div
                className={cn(
                  "flex items-center transition-all duration-300 rounded-full",
                  isSearchActive ? "bg-[#141414] border border-white/30" : "hover:bg-white/10",
                  isSearchActive ? "w-48 sm:w-56 md:w-64" : "w-8 sm:w-10"
                )}
              >
                <button
                  onClick={() => {
                    setIsSearchActive(true);
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
                
                {isSearchActive && (
                  <form onSubmit={handleSearch} className="flex-1 pr-2">
                    <input
                      type="text"
                      placeholder="Titles, people, genres"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      autoFocus
                      className="w-full bg-transparent text-white text-xs sm:text-sm placeholder:text-gray-400 focus:outline-none"
                    />
                  </form>
                )}

                {isSearchActive && searchInput && (
                  <button
                    onClick={clearSearch}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Search Dropdown */}
              {isSearchActive && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto bg-[#1f1f1f] rounded-lg shadow-xl border border-[#333]">
                  {searchInput.length >= 2 ? (
                    <>
                      {searching ? (
                        <div className="p-4 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.map((result) => (
                            <Link
                              key={result._id}
                              href={result.type === "series" ? `/series/${result._id}` : `/movie/${result._id}`}
                              onClick={() => {
                                setIsSearchActive(false);
                                setSearchInput("");
                                setSearchResults([]);
                              }}
                              className="flex items-center gap-3 px-3 py-2 hover:bg-[#333] transition-colors"
                            >
                              <div className="w-10 h-14 relative rounded overflow-hidden flex-shrink-0">
                                {result.poster ? (
                                  <Image
                                    src={result.poster}
                                    alt={result.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                    {result.type === "series" ? <Tv className="w-4 h-4 text-gray-400" /> : <Film className="w-4 h-4 text-gray-400" />}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{result.title}</p>
                                <p className="text-gray-400 text-xs">
                                  {result.year} • {result.type === "series" ? "TV Show" : "Movie"}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-gray-400 text-sm">No results found</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3">
                      <p className="text-xs text-gray-400 mb-2">Type at least 2 characters to search</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications - Desktop */}
            <button className="hidden sm:block p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Profile Dropdown - Desktop */}
            <div className="hidden sm:flex items-center gap-1.5 cursor-pointer group">
              <div className="w-6 sm:w-7 md:w-8 rounded overflow-hidden">
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white group-hover:rotate-180 transition-transform" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#141414] border-t border-gray-800">
          <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearch(e); setIsMobileMenuOpen(false); }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search movies, shows..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-white text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#e50914]"
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

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block text-sm sm:text-base py-2 transition-colors hover:text-white",
                  pathname === link.href ? "text-white font-medium" : "text-gray-400"
                )}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Back to Home */}
            {!isHomePage && (
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm sm:text-base py-2 text-[#e50914] font-medium"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
