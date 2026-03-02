"use client";

import { Suspense, useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Film, Tv, Download, MessageSquare } from "lucide-react";
import { store } from "@/redux/store";
import { setTypeFilter } from "@/redux/slices/uiSlice";

function useStore() {
  return useSyncExternalStore(
    store.subscribe,
    store.getState,
    () => null
  );
}

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduxState = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const type = searchParams.get("type") || "all";
      store.dispatch(setTypeFilter(type as "all" | "movie" | "series"));
    }
  }, [searchParams, mounted]);

  const typeFilter = reduxState?.ui?.typeFilter || "all";

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
          href="/movies"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/movies") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <Film className="w-6 h-6" />
          <span className="text-xs mt-1">Movies</span>
        </Link>

        <Link
          href="/all-series"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/all-series") ? "text-red-600" : "text-gray-400"
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

        <Link
          href="/request"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/request") ? "text-red-600" : "text-gray-400"
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs mt-1">Request</span>
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
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <Download className="w-6 h-6" />
          <span className="text-xs mt-1">Download</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs mt-1">Request</span>
        </div>
      </div>
    </nav>
  );
}

export default function BottomNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <BottomNavFallback />;
  }

  return (
    <Suspense fallback={<BottomNavFallback />}>
      <BottomNavContent />
    </Suspense>
  );
}
