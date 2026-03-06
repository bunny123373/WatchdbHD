"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Download, ArrowLeft, Calendar, Globe, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { IContent } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import ContentGrid from "@/components/ContentGrid";
import { normalizeExternalUrl } from "@/utils/url";

function WatchMovieContent() {
  const params = useParams();
  const [movie, setMovie] = useState<IContent | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  const movieDownloadUrl = normalizeExternalUrl(movie?.downloadLink);
  const primaryEmbedLink = activeServer === 2 ? movie?.embedIframeLink2 : movie?.embedIframeLink;

  useEffect(() => {
    if (params.id) {
      fetchMovie();
      setActiveServer(1);
    }
  }, [params.id]);

  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
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
      <div className="min-h-screen bg-[#141814]">
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
      <div className="min-h-screen bg-[#141814]">
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
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href={`/movie/${String(movie._id)}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Movie Details
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {movie.hlsUrl ? (
              <HlsPlayer src={movie.hlsUrl} title={movie.title} />
            ) : (
              <IframePlayer src={primaryEmbedLink} title={movie.title} />
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          >
            <div className="hidden md:block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-gray-800">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-md">MOVIE</span>
                {movie.quality && (
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-md">{movie.quality}</span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-400">
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
              </div>

              {movie.description && (
                <p className="text-gray-300 leading-relaxed">{movie.description}</p>
              )}

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-gray-400 mb-3">Switch servers if playback is slow.</p>
                <div className="flex flex-wrap gap-3">
                  {movieDownloadUrl && (
                    <a
                      href={movieDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </a>
                  )}
                  {movie.embedIframeLink && (
                    <button
                      onClick={() => setActiveServer(1)}
                      className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${
                        activeServer === 1
                          ? "bg-[#e50914] hover:bg-[#f40612] text-white"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      <Play className="w-5 h-5" />
                      Server 1
                    </button>
                  )}
                  {movie.embedIframeLink2 && (
                    <button
                      onClick={() => setActiveServer(activeServer === 2 ? 1 : 2)}
                      className={`inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${
                        activeServer === 2
                          ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                          : "bg-gray-700 hover:bg-gray-600 text-white"
                      }`}
                    >
                      <ExternalLink className="w-5 h-5" />
                      Server 2
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {relatedMovies.length > 0 && (
          <ContentGrid title="Related Movies" items={relatedMovies} isNetflixStyle />
        )}
      </div>

      <Footer />
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
