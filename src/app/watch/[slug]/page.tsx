"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Download, Calendar, Globe, ChevronLeft, Star, Share2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { IContent } from "@/models/Content";
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
      <div className="min-h-screen bg-black">
        <div className="w-full aspect-video bg-zinc-900 animate-pulse" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <Link href="/" className="text-red-600 hover:text-red-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href={`/movie/${String(movie._id)}`}
            className="flex items-center gap-2 text-white hover:text-red-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {movie.quality && (
              <span className="px-2 py-0.5 text-xs font-bold bg-white/20 text-white rounded">
                {movie.quality}
              </span>
            )}
            <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">
              HD
            </span>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="w-full bg-black">
        {movie.hlsUrl ? (
          <HlsPlayer src={movie.hlsUrl} title={movie.title} poster={movie.poster} />
        ) : movie.embedIframeLink ? (
          <IframePlayer src={primaryEmbedLink} title={movie.title} />
        ) : (
          <div className="w-full aspect-video bg-zinc-900 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Stream Available</h3>
              <p className="text-zinc-500 mb-4">Add HLS URL or Embed Link in admin panel</p>
              {movieDownloadUrl && (
                <a
                  href={movieDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{movie.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-5">
            {movie.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {movie.year}
              </span>
            )}
            {movie.language && (
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {movie.language}
              </span>
            )}
            {movie.rating && (
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-yellow-500" />
                {movie.rating}%
              </span>
            )}
          </div>

          {/* Server Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            {movie.embedIframeLink && (
              <button
                onClick={() => setActiveServer(1)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  activeServer === 1 
                    ? "bg-red-600 text-white" 
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
                }`}
              >
                Server 1
              </button>
            )}
            {movie.embedIframeLink2 && (
              <button
                onClick={() => setActiveServer(2)}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  activeServer === 2 
                    ? "bg-red-600 text-white" 
                    : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
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
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>

          {/* Description */}
          {movie.description && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Synopsis</h3>
              <p className="text-gray-400 leading-relaxed">{movie.description}</p>
            </div>
          )}

          {/* Tags */}
          {movie.tags && movie.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-zinc-800 text-gray-400 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="mt-10">
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WatchMovieContent />
    </Suspense>
  );
}
