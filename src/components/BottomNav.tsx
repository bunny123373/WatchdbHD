"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Home, Film, Tv, Download } from "lucide-react";

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const type = searchParams.get("type") || "all";
    setTypeFilter(type);
  }, [searchParams]);

  const isActive = (path: string, type?: string) => {
    if (path === "/" && !type) return pathname === "/";
    if (type) return pathname === path && typeFilter === type;
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-zinc-800 z-50 lg:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          href="/?type=movie"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/", "movie") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Film className="w-6 h-6" />
          <span className="text-xs mt-1">Movies</span>
        </Link>

        <Link
          href="/?type=series"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/", "series") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Tv className="w-6 h-6" />
          <span className="text-xs mt-1">Series</span>
        </Link>

        <Link
          href="/download"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/download") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Download className="w-6 h-6" />
          <span className="text-xs mt-1">Download</span>
        </Link>
      </div>
    </nav>
  );
}

function BottomNavFallback() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-zinc-800 z-50 lg:hidden">
      <div className="flex items-center justify-around h-16">
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Film className="w-6 h-6" />
          <span className="text-xs mt-1">Movies</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Tv className="w-6 h-6" />
          <span className="text-xs mt-1">Series</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Download className="w-6 h-6" />
          <span className="text-xs mt-1">Download</span>
        </div>
      </div>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={<BottomNavFallback />}>
      <BottomNavContent />
    </Suspense>
  );
}
