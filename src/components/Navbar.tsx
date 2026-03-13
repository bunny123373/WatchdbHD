"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, X, Film, Tv, Home, Star, Calendar, Loader2, Menu } from "lucide-react";
import { cn } from "@/utils/cn";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdminRoute = pathname.startsWith("/admin");
  const isPlayerRoute = pathname.startsWith("/watch/") || pathname.startsWith("/series/watch/");
  if (isAdminRoute || isPlayerRoute) return null;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/?q=${encodeURIComponent(searchInput.trim())}`);
      setIsSearchOpen(false);
      setSearchResults([]);
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

  if (!mounted) return null;

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-colors",
      isScrolled ? "bg-black" : "bg-gradient-to-b from-black/90 to-transparent"
    )}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-[#e50914]">
            WATCH<span className="text-white">DB</span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded transition-colors",
                  pathname === link.href || (pathname === "/" && link.href === "/")
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <div
              className={cn(
                "flex items-center transition-all rounded",
                isSearchOpen ? "bg-[#222] border border-white/20" : "hover:bg-white/10"
              )}
            >
              <button
                onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-white" />
              </button>

              {isSearchOpen && (
                <>
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-32 md:w-48 bg-transparent text-white text-sm placeholder:text-gray-500 focus:outline-none"
                      autoFocus
                    />
                  </form>
                  {searchInput ? (
                    <button onClick={() => setSearchInput("")} className="p-1 mr-1">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  ) : (
                    <button onClick={() => setIsSearchOpen(false)} className="p-1 mr-1">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </>
              )}
            </div>

            {isSearchOpen && searchInput.length >= 2 && (
              <div className="absolute top-full right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-[#1a1a1a] rounded border border-white/10">
                {searching ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    {searchResults.map((result) => (
                      <Link
                        key={result._id}
                        href={result.type === "series" ? `/series/${result._id}` : `/movie/${result._id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchInput("");
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-8 h-10 relative rounded overflow-hidden flex-shrink-0 bg-gray-800">
                          {result.poster && <Image src={result.poster} alt={result.title} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{result.title}</p>
                          <p className="text-gray-500 text-xs">{result.year}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">No results</div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsSearchOpen(false); }}
            className="p-2 hover:bg-white/10 rounded md:hidden"
            aria-label="Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black px-4 py-4">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium rounded transition-colors",
                  pathname === link.href || (pathname === "/" && link.href === "/")
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
