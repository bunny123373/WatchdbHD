"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ChevronLeft, Play, Star, Calendar, Clock, Tv } from "lucide-react";
import { IContent } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
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
  const hasVideo = movie.hlsUrl || movie.embedIframeLink;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/movie/${String(movie._id)}`}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            {movie.quality && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                {movie.quality}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Player Section */}
      <div className="pt-14">
        {movie.hlsUrl ? (
          <HlsPlayer src={movie.hlsUrl} title={movie.title} poster={movie.poster} />
        ) : movie.embedIframeLink ? (
          <IframePlayer src={primaryEmbedLink} title={movie.title} autoPlay={movie.autoPlay} />
        ) : (
          <div className="w-full aspect-video bg-black flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/50 mb-4">No stream available</p>
              {movieDownloadUrl && (
                <a
                  href={movieDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#e50914] text-white rounded-sm text-sm font-medium"
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title & Meta */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
            {movie.year && <span>{movie.year}</span>}
            {movie.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {movie.rating}
              </span>
            )}
            {movie.quality && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                {movie.quality}
              </span>
            )}
            {movie.language && <span>{movie.language}</span>}
          </div>
        </div>

        {/* Server Selection */}
        {movie.embedIframeLink && (
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => setActiveServer(1)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                activeServer === 1
                  ? "bg-[#e50914] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Server 1
            </button>
            {movie.embedIframeLink2 && (
              <button
                onClick={() => setActiveServer(2)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  activeServer === 2
                    ? "bg-[#e50914] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
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
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-sm text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        )}

        {/* Description */}
        {movie.description && (
          <div className="mb-8">
            <p className="text-gray-300 leading-relaxed">{movie.description}</p>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-white/10">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Type</p>
            <p className="text-white text-sm font-medium">Movie</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Quality</p>
            <p className="text-white text-sm font-medium">{movie.quality || "HD"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Language</p>
            <p className="text-white text-sm font-medium">{movie.language || "Telugu"}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Stream</p>
            <p className="text-white text-sm font-medium">
              {movie.hlsUrl ? "Native HLS" : primaryEmbedLink ? "Embed" : "Download Only"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
