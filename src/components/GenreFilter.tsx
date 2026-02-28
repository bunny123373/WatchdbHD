"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const genres = [
  { id: "all", label: "All" },
  { id: "action", label: "Action" },
  { id: "comedy", label: "Comedy" },
  { id: "drama", label: "Drama" },
  { id: "thriller", label: "Thriller" },
  { id: "horror", label: "Horror" },
  { id: "romance", label: "Romance" },
  { id: "sci-fi", label: "Sci-Fi" },
  { id: "animation", label: "Animation" },
  { id: "documentary", label: "Documentary" },
];

export default function GenreFilter() {
  const [selectedGenre, setSelectedGenre] = useState("all");
  const router = useRouter();

  const handleGenreClick = (genreId: string) => {
    setSelectedGenre(genreId);
    if (genreId === "all") {
      router.push("/");
    } else {
      router.push(`/?genre=${genreId}`);
    }
  };

  return (
    <div className="lg:hidden px-4 py-3 -mt-2 mb-2">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => handleGenreClick(genre.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedGenre === genre.id
                ? "bg-[#e50914] text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }`}
          >
            {genre.label}
          </button>
        ))}
      </div>
    </div>
  );
}
