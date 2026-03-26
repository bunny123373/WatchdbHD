"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Download, ChevronLeft } from "lucide-react";
import { IContent } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import WatchPlayerShell from "@/components/WatchPlayerShell";
import MovieRecommendations from "@/components/MovieRecommendations";
import AudioTrackSelector from "@/components/AudioTrackSelector";
import { normalizeExternalUrl, isDirectFileUrl, isAudioFileUrl, getFileExtension, downloadFile } from "@/utils/url";
import { AudioTrack } from "@/hooks/useAudioTracks";

interface WatchMovieClientProps {
  movie: IContent;
}

export default function WatchMovieClient({ movie }: WatchMovieClientProps) {
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  const [langServer, setLangServer] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioTrackId, setActiveAudioTrackId] = useState<number>(0);

  const handleAudioTracksChange = useCallback((tracks: AudioTrack[], activeTrackId: number) => {
    setAudioTracks(tracks);
    setActiveAudioTrackId(activeTrackId);
  }, []);

  const languageSources = movie.languageSources || [];
  const availableLanguages = languageSources.filter(ls => ls.hlsUrl || ls.embedLink);

  useEffect(() => {
    const savedLang = localStorage.getItem(`watch_lang_${movie._id}`);
    if (savedLang && availableLanguages.some(ls => ls.language === savedLang)) {
      setSelectedLanguage(savedLang);
    } else if (availableLanguages.length > 0) {
      const defaultLang = movie.language || "Telugu";
      const matchedLang = availableLanguages.find(ls => 
        ls.language?.toLowerCase().includes(defaultLang.toLowerCase()) ||
        defaultLang.toLowerCase().includes(ls.language?.toLowerCase() || "")
      );
      setSelectedLanguage(matchedLang?.language || availableLanguages[0].language);
    } else {
      setSelectedLanguage("");
    }
    setActiveServer(1);
    setLangServer(1);
  }, [movie._id, movie.language, availableLanguages]);

  useEffect(() => {
    if (selectedLanguage) {
      localStorage.setItem(`watch_lang_${movie._id}`, selectedLanguage);
    } else {
      localStorage.removeItem(`watch_lang_${movie._id}`);
    }
  }, [selectedLanguage, movie._id]);

  const handleDownload = (url: string) => {
    if (isDirectFileUrl(url)) {
      const ext = getFileExtension(url) || ".mp4";
      downloadFile(url, `${movie.title}${ext}`);
    } else {
      window.open(url, "_blank");
    }
  };

  const movieDownloadUrl = normalizeExternalUrl(movie.downloadLink);
  const primaryEmbedLink = activeServer === 2 ? movie.embedIframeLink2 : movie.embedIframeLink;
  
  const selectedLangSource = selectedLanguage 
    ? availableLanguages.find(ls => ls.language === selectedLanguage)
    : null;
  
  const langEmbedLink = langServer === 2 && selectedLangSource?.embedLink?.includes('/embed/') 
    ? selectedLangSource.embedLink.replace('/embed/', '/embed-2/') 
    : selectedLangSource?.embedLink;
  
  const currentHlsUrl = selectedLangSource?.hlsUrl || movie.hlsUrl;
  const currentEmbedLink = selectedLangSource ? langEmbedLink : primaryEmbedLink;
  const currentDownloadUrl = normalizeExternalUrl(selectedLangSource?.downloadLink) || movieDownloadUrl;
  const currentSourceUrl = currentHlsUrl || currentEmbedLink;
  
  const isAudioFile = currentEmbedLink ? isAudioFileUrl(currentEmbedLink) : false;
  const directFileUrl = isAudioFile ? currentEmbedLink : undefined;
  
  const hasVideo = movie.hlsUrl || movie.embedIframeLink || availableLanguages.length > 0;
  const hasDownload = currentDownloadUrl || currentSourceUrl;

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
        </div>
      </div>

      {/* Player Section - Full Width */}
      <div className="pt-14 w-full px-2 sm:px-3 lg:px-4 pb-4">
        <WatchPlayerShell
          eyebrow="Now Playing"
          title={movie.title}
          subtitle={movie.year ? `Released ${movie.year}` : undefined}
          badges={
            <div className="flex items-center gap-2">
              {movie.quality && (
                <span className="px-2.5 py-1 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                  {movie.quality}
                </span>
              )}
              {movie.language && (
                <span className="px-2.5 py-1 text-[10px] font-medium bg-white/10 text-white/70 rounded-sm">
                  {movie.language}
                </span>
              )}
              {currentHlsUrl && (
                <span className="px-2.5 py-1 text-[10px] font-medium bg-green-600/20 text-green-400 rounded-sm">
                  HLS
                </span>
              )}
            </div>
          }
          actions={
            hasDownload ? (
              <button
                onClick={() => handleDownload(currentDownloadUrl || currentSourceUrl || "")}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            ) : undefined
          }
        >
          {currentHlsUrl ? (
            <HlsPlayer 
              src={currentHlsUrl} 
              title={movie.title}
              poster={movie.poster}
              onEnded={() => {
                console.log("Video ended");
              }}
              onAudioTracksChange={handleAudioTracksChange}
            />
          ) : directFileUrl ? (
            <HlsPlayer 
              src={directFileUrl} 
              title={movie.title}
              poster={movie.poster}
              onEnded={() => {
                console.log("Playback ended");
              }}
              onAudioTracksChange={handleAudioTracksChange}
            />
          ) : currentEmbedLink ? (
            <IframePlayer src={currentEmbedLink} title={movie.title} autoPlay={movie.autoPlay} />
          ) : hasVideo ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/50 mb-4">Select a language to play</p>
              </div>
            </div>
          ) : hasDownload ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/50 mb-4">No stream available</p>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/50 mb-4">No stream available</p>
              </div>
            </div>
          )}
        </WatchPlayerShell>

        {/* Language Selection */}
        {hasVideo && availableLanguages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
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

        {/* Embedded Audio Track Selection */}
        {audioTracks.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <AudioTrackSelector
              tracks={audioTracks}
              activeTrackId={activeAudioTrackId}
              onTrackChange={setActiveAudioTrackId}
              variant="inline"
              showLabel={true}
            />
          </div>
        )}

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

        <MovieRecommendations currentContent={movie} />
      </div>
    </div>
  );
}
