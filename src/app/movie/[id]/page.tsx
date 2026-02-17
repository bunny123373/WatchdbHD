"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, ThumbsUp, Share } from "lucide-react";
import { IContent } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import AdBanner from "@/components/AdBanner";

export default function MovieDetailsPage() {
  const params = useParams();
  const [movie, setMovie] = useState<IContent | null>(null);
  const [similarMovies, setSimilarMovies] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const movieId = params.id;
    if (movieId) {
      console.log("Movie ID from params:", movieId);
      fetchMovie(movieId as string);
    }
  }, [params.id]);

  const fetchMovie = async (movieId: string) => {
    try {
      console.log("Fetching movie with ID:", movieId);
      setError(null);
      const response = await fetch(`/api/content/${movieId}`);
      const data = await response.json();
      console.log("API response:", data);
      console.log("Response status:", response.status);
      
      if (data.success && data.data) {
        setMovie(data.data);
        if (data.data.language) {
          fetchSimilarMovies(data.data.language, data.data._id);
        }
      } else {
        setError(data.error || "Movie not found");
        console.error("Movie not found or error:", data.error);
      }
    } catch (error) {
      setError("Failed to fetch movie");
      console.error("Failed to fetch movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarMovies = async (language: string, excludeId: string) => {
    try {
      const response = await fetch(`/api/content?type=movie&language=${language}`);
      const data = await response.json();
      if (data.success) {
        setSimilarMovies(data.data.filter((m: IContent) => String(m._id) !== excludeId).slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch similar movies:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-16">
          <div className="h-[50vh] bg-gray-900 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-32 text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Movie not found</h1>
          {error && (
            <p className="text-gray-400 text-sm mb-4">{error}</p>
          )}
          <Link href="/" className="text-red-600 hover:text-red-500 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-16">
        {/* Netflix Hero Section */}
        <div className="relative w-full aspect-[16/9] h-auto min-h-[300px] max-h-[500px] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={movie.banner || movie.poster}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/40 to-[#141414]" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-8 md:pb-12">
            <div className="max-w-xl lg:max-w-2xl space-y-3 md:space-y-4">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {movie.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                {movie.rating && (
                  <span className="text-green-400 font-semibold">{movie.rating} Match</span>
                )}
                {movie.year && (
                  <span className="text-white/80">{movie.year}</span>
                )}
                {movie.quality && (
                  <span className="text-white font-bold bg-[#e50914] px-1.5 py-0.5 text-xs rounded">
                    {movie.quality}
                  </span>
                )}
                <span className="text-white/80">{movie.language}</span>
                <span className="text-white/60">Movie</span>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link href={`/watch/${String(movie._id)}`}>
                  <button className="bg-white text-black hover:bg-white/90 rounded px-5 md:px-7 py-2 md:py-2.5 flex items-center gap-2 font-bold text-sm">
                    <Play className="w-4 h-4 fill-black" />
                    Play
                  </button>
                </Link>
                <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              {movie.description && (
                <p className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-2">
                  {movie.description}
                </p>
              )}

              {/* Tags */}
              {movie.tags && movie.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          {/* Ad */}
          <div className="mb-6 sm:mb-8">
            <AdBanner slot="movie-details" className="w-full h-16 sm:h-20 md:h-24" />
          </div>

          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
              <ContentGrid title="" items={similarMovies} isNetflixStyle />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
