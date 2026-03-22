"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, ChevronLeft, Star } from "lucide-react";
import { IContent } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import { normalizeExternalUrl } from "@/utils/url";

interface WatchMovieClientProps {
  movie: IContent;
}

export default function WatchMovieClient({ movie }: WatchMovieClientProps) {
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  const [langServer, setLangServer] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    const savedLang = localStorage.getItem(`watch_lang_${movie._id}`);
    if (savedLang) {
      setSelectedLanguage(savedLang);
    } else {
      setSelectedLanguage("");
    }
    setActiveServer(1);
    setLangServer(1);
  }, [movie._id]);

  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem(`watch_lang_${movie._id}`, selectedLanguage);
    } else {
      localStorage.removeItem(`watch_lang_${movie._id}`);
    }
  }, [selectedLanguage, movie._id]);

  const movieDownloadUrl = normalizeExternalUrl(movie.downloadLink);
  const primaryEmbedLink = activeServer === 2 ? movie.embedIframeLink2 : movie.embedIframeLink;
  
  const languageSources = movie.languageSources || [];
  const availableLanguages = languageSources.filter(ls => ls.hlsUrl || ls.embedLink);
  
  const selectedLangSource = selectedLanguage 
    ? availableLanguages.find(ls => ls.language === selectedLanguage)
    : null;
  
  const langEmbedLink = langServer === 2 ? selectedLangSource?.embedLink?.replace('/embed/', '/embed-2/') : selectedLangSource?.embedLink;
  
  const currentHlsUrl = selectedLangSource?.hlsUrl || movie.hlsUrl;
  const currentEmbedLink = selectedLangSource ? langEmbedLink : primaryEmbedLink;
  const currentDownloadUrl = normalizeExternalUrl(selectedLangSource?.downloadLink) || movieDownloadUrl;
  
  const hasVideo = movie.hlsUrl || movie.embedIframeLink || availableLanguages.length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
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

      {/* Player Section - Full Width */}
      <div className="pt-14 w-full">
        {currentHlsUrl ? (
          <HlsPlayer src={currentHlsUrl} title={movie.title} poster={movie.poster} />
        ) : currentEmbedLink ? (
          <IframePlayer src={currentEmbedLink} title={movie.title} autoPlay={movie.autoPlay} />
        ) : hasVideo ? (
          <div className="w-full aspect-video bg-black flex items-center justify-center max-w-7xl mx-auto">
            <div className="text-center">
              <p className="text-white/50 mb-4">Select a language to play</p>
            </div>
          </div>
        ) : (
          <div className="w-full aspect-video bg-black flex items-center justify-center max-w-7xl mx-auto">
            <div className="text-center">
              <p className="text-white/50 mb-4">No stream available</p>
              {currentDownloadUrl && (
                <a
                  href={currentDownloadUrl}
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

        {/* Server & Language Selection - Full Width */}
        {hasVideo && (
          <div className="max-w-7xl mx-auto px-4">
            {/* Main Server Selection */}
            {movie.embedIframeLink && !selectedLanguage && (
              <div className="flex flex-wrap gap-3 mb-4">
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
                {currentDownloadUrl && (
                  <a
                    href={currentDownloadUrl}
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

            {/* Language Source Server Selection */}
            {selectedLangSource?.embedLink && (
              <div className="flex flex-wrap gap-3 mb-4">
                <span className="text-white/50 text-sm py-2">{selectedLanguage}:</span>
                <button
                  onClick={() => setLangServer(1)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    langServer === 1
                      ? "bg-[#e50914] text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  Server 1
                </button>
                <button
                  onClick={() => setLangServer(2)}
                  className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                    langServer === 2
                      ? "bg-[#e50914] text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  Server 2
                </button>
                {currentDownloadUrl && (
                  <a
                    href={currentDownloadUrl}
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

            {/* Language Selection */}
            {availableLanguages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="text-white/50 text-sm py-2">Audio:</span>
                {(movie.hlsUrl || movie.embedIframeLink) && (
                  <button
                    onClick={() => setSelectedLanguage("")}
                    className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                      !selectedLanguage
                        ? "bg-[#e50914] text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    Default
                  </button>
                )}
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.language}
                    onClick={() => {
                      setSelectedLanguage(lang.language);
                      setLangServer(1);
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                      selectedLanguage === lang.language
                        ? "bg-[#e50914] text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {lang.language}
                  </button>
                ))}
              </div>
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
              {currentHlsUrl ? "Native HLS" : currentEmbedLink ? "Embed" : "Download Only"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
