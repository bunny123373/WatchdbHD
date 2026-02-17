"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Menu, X, Film, Tv } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSearch, setTypeFilter } from "@/redux/slices/uiSlice";
import { cn } from "@/utils/cn";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const { search, typeFilter } = useAppSelector((state) => state.ui);
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoute = pathname.startsWith("/admin");
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
      router.push("/");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    dispatch(setSearch(""));
  };

  const navLinks = [
    { href: "/", label: "Home", type: "all" },
    { href: "/?type=series", label: "TV Shows", type: "series" },
    { href: "/?type=movie", label: "Movies", type: "movie" },
  ];

  const handleTypeFilter = (type: string) => {
    dispatch(setTypeFilter(type as "all" | "movie" | "series"));
    router.push(type === "all" ? "/" : `/?type=${type}`);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
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

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => handleTypeFilter(link.type)}
                  className={cn(
                    "text-xs sm:text-sm transition-colors hover:text-white",
                    typeFilter === link.type || (pathname === "/" && link.type === "all")
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
              {isSearchActive && searchInput && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-[#1f1f1f] rounded-lg shadow-xl border border-[#333] overflow-hidden">
                  <div className="p-3">
                    <p className="text-xs text-gray-400 mb-2">Search for "{searchInput}"</p>
                    <button
                      onClick={handleSearch}
                      className="w-full py-2 px-3 bg-[#e50914] hover:bg-[#b2070f] text-white text-sm rounded font-medium transition-colors"
                    >
                      Search
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications - Desktop */}
            <button className="hidden sm:block p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

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
                onClick={() => {
                  handleTypeFilter(link.type);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "block text-sm sm:text-base py-2 transition-colors hover:text-white",
                  typeFilter === link.type ? "text-white font-medium" : "text-gray-400"
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
