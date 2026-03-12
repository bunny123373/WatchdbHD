"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, Film, Tv, Home, Loader2, Star, Calendar } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSearch } from "@/redux/slices/uiSlice";
import { cn } from "@/utils/cn";
import LanguageSelector from "@/components/LanguageSelector";
import Logo from "@/components/Logo";

interface SearchResult {
  _id: string;
  title: string;
  poster: string;
  type: string;
  year: string;
}

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/all-series", label: "TV Shows", icon: Tv },
  { href: "/movies", label: "Movies", icon: Film },
  { href: "/collections", label: "Collections", icon: Star },
  { href: "/request", label: "Request", icon: Calendar },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = pathname.startsWith("/admin");
  const isPlayerRoute = pathname.startsWith("/watch/") || pathname.startsWith("/series/watch/");
  if (isAdminRoute || isPlayerRoute) return null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchActive(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch(setSearch(searchInput.trim()));
      setIsSearchActive(false);
      setSearchResults([]);
      router.push("/");
    }
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          isScrolled || isSearchActive || isMenuOpen ? "bg-[#141414] border-b border-white/5" : "bg-gradient-to-b from-black/90 to-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 sm:gap-2">
              <Logo size="md" className="w-8 h-8" />
              <span className="text-lg sm:text-xl font-bold text-[#e50914] tracking-tight">
                WATCH<span className="text-white">DB</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-5 lg:gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white",
                    pathname === link.href || (pathname === "/" && link.href === "/")
                      ? "bg-white/10 text-white"
                      : "text-gray-400"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <div
                  className={cn(
                    "flex items-center transition-all duration-300 rounded-full",
                    isSearchActive ? "bg-[#141414] border border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.28)]" : "hover:bg-white/10",
                    isSearchActive ? "w-48 sm:w-56 md:w-64" : "w-8 sm:w-10"
                  )}
                >
                  <button
                    onClick={() => setIsSearchActive(true)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>

                  {isSearchActive && (
                    <>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1 bg-transparent text-white text-sm placeholder:text-gray-400 focus:outline-none pr-2"
                        autoFocus
                      />
                      {searchInput && (
                        <button onClick={() => setSearchInput("")} className="p-1 mr-1">
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Search Dropdown */}
                {isSearchActive && searchInput.length >= 2 && (
                  <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 max-h-96 overflow-y-auto bg-[#1f1f1f] rounded-lg shadow-xl border border-[#333]">
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
                                <Image src={result.poster} alt={result.title} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  {result.type === "series" ? <Tv className="w-4 h-4 text-gray-400" /> : <Film className="w-4 h-4 text-gray-400" />}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{result.title}</p>
                              <p className="text-gray-400 text-xs">{result.year}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-sm">No results found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Language */}
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors md:hidden"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 bg-black/95 backdrop-blur-sm">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Nav Links */}
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    pathname === link.href || (pathname === "/" && link.href === "/")
                      ? "bg-red-600/20 text-red-500"
                      : "text-gray-300 hover:bg-white/10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}

            {/* Mobile Language */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-gray-400 text-sm px-4 mb-2">Language</p>
              <LanguageSelector />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
