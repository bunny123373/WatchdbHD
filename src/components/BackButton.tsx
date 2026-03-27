"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-50"
      aria-label="Go back"
    >
      <ChevronLeft className="w-6 h-6 text-white" />
    </button>
  );
}
