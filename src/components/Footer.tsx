"use client";

import Link from "next/link";
import { Heart, Github, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#141414] border-t border-[#333] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-[#e50914]">
                WATCH<span className="text-white">TMDB</span>
              </span>
            </Link>
            <p className="text-[#808080] max-w-sm mb-6">
              Watch. Download. Stream Premium Cinema. Your ultimate destination for Telugu movies and web series.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#808080] hover:text-white hover:bg-[#444] transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#808080] hover:text-white hover:bg-[#444] transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#808080] hover:text-white hover:bg-[#444] transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[#808080] hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/?type=movie" className="text-[#808080] hover:text-white transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/?type=series" className="text-[#808080] hover:text-white transition-colors">
                  Web Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/?category=Trending" className="text-[#808080] hover:text-white transition-colors">
                  Trending
                </Link>
              </li>
              <li>
                <Link href="/?category=Latest" className="text-[#808080] hover:text-white transition-colors">
                  Latest
                </Link>
              </li>
              <li>
                <Link href="/?category=Dubbed" className="text-[#808080] hover:text-white transition-colors">
                  Dubbed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#333] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#808080] text-sm">
            WatchTMDB &copy; {currentYear}. All rights reserved.
          </p>
          <p className="text-[#808080] text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-[#e50914] fill-current" /> for cinema lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
