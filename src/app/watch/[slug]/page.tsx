"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, ChevronLeft, Clapperboard } from "lucide-react";
import { motion } from "framer-motion";
import { IContent } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import WatchPlayerShell from "@/components/WatchPlayerShell";
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
      }
    } catch (error) {
      console.error("Failed to fetch movie:", error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.14),_transparent_22%),linear-gradient(180deg,_#050505_0%,_#090909_45%,_#040404_100%)]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-black via-black/85 to-transparent">
        <div
          className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-3 pt-3 sm:px-6 lg:px-8"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <Link
            href={`/movie/${String(movie._id)}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:border-white/20 hover:bg-black/45 hover:text-red-400"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2">
            {movie.quality && (
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                {movie.quality}
              </span>
            )}
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.3)]">
              HD
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WatchPlayerShell
            eyebrow="Now Playing"
            title={movie.title}
            subtitle=""
            actions={
              <>
                {movie.embedIframeLink && (
                  <button
                    onClick={() => setActiveServer(1)}
                    className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      activeServer === 1
                        ? "bg-[#e50914] text-white shadow-[0_10px_30px_rgba(229,9,20,0.28)]"
                        : "border border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.08]"
                    }`}
                  >
                    Server 1
                  </button>
                )}
                {movie.embedIframeLink2 && (
                  <button
                    onClick={() => setActiveServer(2)}
                    className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      activeServer === 2
                        ? "bg-[#e50914] text-white shadow-[0_10px_30px_rgba(229,9,20,0.28)]"
                        : "border border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.08]"
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
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
              </>
            }
          >
            {movie.hlsUrl ? (
              <HlsPlayer src={movie.hlsUrl} title={movie.title} poster={movie.poster} />
            ) : movie.embedIframeLink ? (
              <IframePlayer src={primaryEmbedLink} title={movie.title} />
            ) : (
              <div className="watch-player-shell relative flex aspect-video items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.15),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
                <div className="relative text-center p-8">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Clapperboard className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">No Stream Available</h3>
                  <p className="mb-4 text-zinc-500">Add an HLS URL or embed link in the admin panel.</p>
                  {movieDownloadUrl && (
                    <a
                      href={movieDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            )}
          </WatchPlayerShell>
        </motion.div>
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
