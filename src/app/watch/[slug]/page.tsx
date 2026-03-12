"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Download, Calendar, Globe, ChevronLeft, Star, Clapperboard, BadgeInfo, Clock3, Film } from "lucide-react";
import { motion } from "framer-motion";
import { IContent } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import ContentGrid from "@/components/ContentGrid";
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
            eyebrow={movie.category || "Now Streaming"}
            title={movie.title}
            subtitle={movie.description || "Stream the movie in the best available source, or switch servers if playback is unstable."}
            badges={
              <>
                {movie.year && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200">
                    <Calendar className="h-3.5 w-3.5 text-red-400" />
                    {movie.year}
                  </span>
                )}
                {movie.language && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200">
                    <Globe className="h-3.5 w-3.5 text-red-400" />
                    {movie.language}
                  </span>
                )}
                {movie.rating && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-300">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {movie.rating}%
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
                  <Clapperboard className="h-3.5 w-3.5" />
                  {movie.hlsUrl ? "Premium Stream" : "Embed Stream"}
                </span>
              </>
            }
            actions={
              <>
                {movie.embedIframeLink && (
                  <button
                    onClick={() => setActiveServer(1)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                      activeServer === 1
                        ? "bg-red-600 text-white shadow-[0_10px_30px_rgba(229,9,20,0.28)]"
                        : "border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
                    }`}
                  >
                    Server 1
                  </button>
                )}
                {movie.embedIframeLink2 && (
                  <button
                    onClick={() => setActiveServer(2)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                      activeServer === 2
                        ? "bg-red-600 text-white shadow-[0_10px_30px_rgba(229,9,20,0.28)]"
                        : "border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
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
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2.5 text-sm text-gray-400">
                  <BadgeInfo className="h-4 w-4 text-red-400" />
                  Switch servers if playback is slow.
                </span>
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

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="space-y-4">
              {movie.description && (
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Synopsis</h3>
                  <p className="leading-relaxed text-gray-300">{movie.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Playback</h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-start gap-3">
                      <Film className="mt-0.5 h-4 w-4 text-red-400" />
                      <p>{movie.hlsUrl ? "Adaptive HLS playback is available for smoother streaming." : "Embed playback is active. Switch servers if one source stalls."}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-0.5 h-4 w-4 text-red-400" />
                      <p>Use full screen on mobile for the cleanest viewing layout and better touch controls.</p>
                    </div>
                  </div>
                </div>

                {movie.tags && movie.tags.length > 0 && (
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.tags.map((tag, index) => (
                        <span key={index} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Details</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  {movie.year && (
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-gray-500">Release</span>
                      <span>{movie.year}</span>
                    </div>
                  )}
                  {movie.language && (
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-gray-500">Language</span>
                      <span>{movie.language}</span>
                    </div>
                  )}
                  {movie.quality && (
                    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <span className="text-gray-500">Quality</span>
                      <span>{movie.quality}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Source</span>
                    <span>{movie.hlsUrl ? "HLS Stream" : "Embed Player"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(229,9,20,0.1),rgba(255,255,255,0.02))] p-5 sm:p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white">Viewing Tips</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>Use `Server 1` first, then switch only if playback buffers or the source fails.</p>
                  <p>If download is available, it stays in the action row for quick access on mobile.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {relatedMovies.length > 0 && (
          <div className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.02] py-4">
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
