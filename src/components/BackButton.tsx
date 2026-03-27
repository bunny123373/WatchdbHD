"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  return (
    <Link
      href="/"
      className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-50"
      aria-label="Go home"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </Link>
  );
}
