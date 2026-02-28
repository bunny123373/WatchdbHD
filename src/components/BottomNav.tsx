"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Download, Bookmark } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
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
            isActive("/?type=movie") || isActive("/movie") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Search className="w-6 h-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>

        <Link
          href="/watchlist"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/watchlist") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Bookmark className="w-6 h-6" />
          <span className="text-xs mt-1">Watchlist</span>
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
