"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Download, Calendar, Globe, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { IContent } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import ContentGrid from "@/components/ContentGrid";
import { normalizeExternalUrl } from "@/utils/url";

function resolveContentIdFromSlug(slug: string) {
  const normalized = (slug || "").trim();
  if (!normalized) return normalized;
  const maybeId = normalized.split("-").pop() || normalized;
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(maybeId) ? maybeId : normalized;
}

function WatchMovieContent() {
  const params = useParams();
  const [movie, setMovie] = useState<IContent | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  const slug = params.slug as string;
  const contentId = resolveContentIdFromSlug(slug);
  const movieDownloadUrl = normalizeExternalUrl(movie?.downloadLink);
  const primaryEmbedLink = activeServer === 2 ? movie?.embedIframeLink2 : movie?.embedIframeLink;

  useEffect(() => {
    if (slug) {
      fetchMovie();
      setActiveServer(1);
    }
  }, [slug]);

  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}`);
      const data = await response.json();
      if (data.success) {
        setMovie(data.data);
        fetchRelatedMovies(data.data._id);
      }
    } catch (error) {
      console.error("Failed to fetch movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMovies = async (excludeId: string) => {
    try {
      const response = await fetch("/api/content?type=movie");
      const data = await response.json();
      if (data.success) {
        setRelatedMovies(data.data.filter((m: IContent) => String(m._id) !== excludeId).slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch related movies:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-gray-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-white">Movie not found</h1>
          <Link href="/" className="text-red-600 mt-4 inline-block">
            Go back home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent py-2 sm:py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href={`/movie/${String(movie._id)}`}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="hidden sm:inline font-medium">Back to {movie.title}</span>
          </Link>
          
          <div className="flex items-center gap-3">
            {movie.quality && (
              <span className="px-2 py-0.5 text-xs font-bold bg-black text-white border border-white/50 rounded-sm">
                {movie.quality}
              </span>
            )}
            <span className="px-2 py-0.5 text-xs font-bold bg-black text-white border border-white rounded-sm">
              MOVIE
            </span>
          </div>
        </div>
      </div>

      <div className="pt-14 sm:pt-16 pb-12">
        <div className="w-full aspect-video bg-black">
          {movie.hlsUrl ? (
            <HlsPlayer src={movie.hlsUrl} title={movie.title} />
          ) : (
            <IframePlayer src={primaryEmbedLink} title={movie.title} />
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
              {movie.year && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {movie.year}
                </span>
              )}
              {movie.language && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  {movie.language}
                </span>
              )}
              {movie.rating && (
                <span className="flex items-center gap-1.5 text-yellow-500">
                  ★ {movie.rating}
                </span>
              )}
            </div>

            {movie.description && (
              <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">{movie.description}</p>
            )}

            <div className="flex flex-wrap gap-3">
              {movie.embedIframeLink && (
                <button
                  onClick={() => setActiveServer(1)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-md transition-colors ${
                    activeServer === 1
                      ? "bg-[#e50914] hover:bg-[#f40612] text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Server 1
                </button>
              )}
              {movie.embedIframeLink2 && (
                <button
                  onClick={() => setActiveServer(activeServer === 2 ? 1 : 2)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 font-semibold rounded-md transition-colors ${
                    activeServer === 2
                      ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Server 2
                </button>
              )}
              {movieDownloadUrl && (
                <a
                  href={movieDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {relatedMovies.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContentGrid title="More Movies" items={relatedMovies} isNetflixStyle />
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchMoviePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141814] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WatchMovieContent />
    </Suspense>
  );
}
