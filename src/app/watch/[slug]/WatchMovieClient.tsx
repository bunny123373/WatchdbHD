"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ChevronLeft, Clapperboard, Clock3, Film, Star } from "lucide-react";
import { IContent } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import WatchPlayerShell from "@/components/WatchPlayerShell";
import { normalizeExternalUrl } from "@/utils/url";

interface WatchMovieClientProps {
  movie: IContent;
}

export default function WatchMovieClient({ movie }: WatchMovieClientProps) {
  const [activeServer, setActiveServer] = useState<1 | 2>(1);

  useEffect(() => {
    setActiveServer(1);
  }, [movie._id]);

  const movieDownloadUrl = normalizeExternalUrl(movie.downloadLink);
  const primaryEmbedLink = activeServer === 2 ? movie.embedIframeLink2 : movie.embedIframeLink;
  const movieTags = movie.tags?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.16),_transparent_20%),linear-gradient(180deg,_#020202_0%,_#070707_42%,_#020202_100%)]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-black via-black/85 to-transparent">
        <div
          className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 pb-3 pt-3 sm:px-6 lg:px-10"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <Link
            href={`/movie/${String(movie._id)}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-white/20 hover:bg-black/65 hover:text-red-400"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2">
            {movie.quality && (
              <span className="rounded-full border border-white/10 bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                {movie.quality}
              </span>
            )}
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.3)]">
              HD
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-20 sm:px-6 lg:px-10">
        <WatchPlayerShell
          eyebrow="Watch Movie"
          title={movie.title}
          subtitle={movie.description || "Stream instantly in a cleaner, cinema-first layout."}
          badges={
            <>
              {movie.year && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/85">
                  <Clock3 className="h-3.5 w-3.5 text-red-400" />
                  {movie.year}
                </span>
              )}
              {movie.language && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/85">
                  <Film className="h-3.5 w-3.5 text-red-400" />
                  {movie.language}
                </span>
              )}
              {movie.rating && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/85">
                  <Star className="h-3.5 w-3.5 text-red-400" />
                  {movie.rating}/10
                </span>
              )}
            </>
          }
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
              <div className="relative p-8 text-center">
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

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)] sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e50914] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                Now Streaming
              </span>
              {movie.quality && (
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/75">
                  {movie.quality}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-semibold text-white sm:text-3xl">{movie.title}</h2>
            {movie.description && (
              <p className="mt-4 max-w-4xl text-sm leading-7 text-gray-300 sm:text-[15px]">
                {movie.description}
              </p>
            )}

            {movieTags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {movieTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-400">Details</p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-white/45">Type</p>
                <p className="mt-1 font-medium text-white">Movie</p>
              </div>
              <div>
                <p className="text-white/45">Quality</p>
                <p className="mt-1 font-medium text-white">{movie.quality || "HD"}</p>
              </div>
              <div>
                <p className="text-white/45">Language</p>
                <p className="mt-1 font-medium text-white">{movie.language || "Telugu"}</p>
              </div>
              <div>
                <p className="text-white/45">Stream</p>
                <p className="mt-1 font-medium text-white">{movie.hlsUrl ? "Native HLS" : primaryEmbedLink ? "Embed Server" : "Offline"}</p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
