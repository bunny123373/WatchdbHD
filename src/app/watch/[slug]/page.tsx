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
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent">
        <div className="flex items-center justify-between px-3 py-1.5">
          <Link
            href={`/movie/${String(movie._id)}`}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-medium">{movie.title?.slice(0, 12)}{movie.title && movie.title.length > 12 ? '...' : ''}</span>
          </Link>
          
          <div className="flex items-center gap-1.5">
            {movie.quality && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-white/10 text-white rounded">
                {movie.quality}
              </span>
            )}
            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#e50914] text-white rounded">
              HD
            </span>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="pt-10">
        <div className="w-full aspect-video bg-black">
          {movie.hlsUrl ? (
            <HlsPlayer src={movie.hlsUrl} title={movie.title} />
          ) : (
            <IframePlayer src={primaryEmbedLink} title={movie.title} />
          )}
        </div>

        {/* Info Section */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-4">
              {movie.year && <span>{movie.year}</span>}
              {movie.language && <span className="flex items-center gap-1">{movie.language}</span>}
              {movie.rating && <span className="text-yellow-500">★ {movie.rating}</span>}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {movie.embedIframeLink && (
                <button
                  onClick={() => setActiveServer(1)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    activeServer === 1 ? "bg-[#e50914] text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Server 1
                </button>
              )}
              {movie.embedIframeLink2 && (
                <button
                  onClick={() => setActiveServer(2)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    activeServer === 2 ? "bg-[#e50914] text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Server 2
                </button>
              )}
            </div>

            {movie.description && (
              <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">{movie.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {movie.embedIframeLink && (
                <button
                  onClick={() => setActiveServer(1)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    activeServer === 1 ? "bg-[#e50914] text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Server 1
                </button>
              )}
              {movie.embedIframeLink2 && (
                <button
                  onClick={() => setActiveServer(2)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                    activeServer === 2 ? "bg-[#e50914] text-white" : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  Server 2
                </button>
              )}
              {movieDownloadUrl && (
                <a
                  href={movieDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs sm:text-sm font-medium transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {relatedMovies.length > 0 && (
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pb-6">
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
