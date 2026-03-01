"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Home, Film, Tv, Download } from "lucide-react";
import { setTypeFilter } from "@/redux/slices/uiSlice";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const handleTypeClick = (type: "all" | "movie" | "series", path: string) => {
    dispatch(setTypeFilter(type));
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-zinc-800 z-50 lg:hidden">
      <div className="flex items-center justify-around h-16">
        <button
          onClick={() => handleTypeClick("all", "/")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          onClick={() => handleTypeClick("movie", "/?type=movie")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/movie") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Film className="w-6 h-6" />
          <span className="text-xs mt-1">Movies</span>
        </button>

        <button
          onClick={() => handleTypeClick("series", "/?type=series")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/series") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Tv className="w-6 h-6" />
          <span className="text-xs mt-1">Series</span>
        </button>

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
