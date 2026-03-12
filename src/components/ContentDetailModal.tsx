"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Play, Plus, ThumbsUp, ThumbsDown, ChevronDown, Info, Share2, Clapperboard } from "lucide-react";
import { IContent } from "@/models/Content";

interface ContentDetailModalProps {
  content: IContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContentDetailModal({ content, isOpen, onClose }: ContentDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [inMyList, setInMyList] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (content && mounted) {
      const saved = localStorage.getItem("watchlist");
      if (saved) {
        const watchlist = JSON.parse(saved);
        setInMyList(watchlist.some((w: IContent) => String(w._id) === String(content._id)));
      }
    }
  }, [content, mounted]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setLiked(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!mounted || !isOpen || !content) return null;

  const isMovie = content.type === "movie";
  const matchPercentage = Math.floor(Math.random() * 20) + 80;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="absolute inset-0 bg-black" onClick={onClose} />
      
      <div className="relative w-full bg-[#141414] min-h-screen sm:min-h-0 sm:my-8 sm:mx-4 sm:mb-8 sm:rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-[56.25vw] sm:h-[400px] md:h-[450px] lg:h-[500px]">
          <Image
            src={content.banner || content.poster}
            alt={content.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-4 drop-shadow-lg">
                {content.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-5 text-xs sm:text-sm">
                <span className="text-[#46d369] font-bold text-sm sm:text-base">{matchPercentage}% Match</span>
                {content.year && <span className="text-white/90">{content.year}</span>}
                {content.quality && (
                  <span className="text-white font-bold bg-[#e50914] px-1.5 py-0.5 text-[10px] sm:text-xs rounded">
                    {content.quality}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <Link
                  href={isMovie ? `/movie/${String(content._id)}` : `/series/${String(content._id)}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-8 sm:px-10 py-3 bg-white hover:bg-gray-200 text-black font-bold rounded text-sm sm:text-base"
                >
                  <Play className="w-5 h-5 fill-black" />
                  <span>Play</span>
                </Link>
                
                <button 
                  onClick={() => {
                    const saved = localStorage.getItem("watchlist");
                    let watchlist = saved ? JSON.parse(saved) : [];
                    
                    if (inMyList) {
                      watchlist = watchlist.filter((w: IContent) => String(w._id) !== String(content._id));
                    } else {
                      watchlist.push(content);
                    }
                    
                    localStorage.setItem("watchlist", JSON.stringify(watchlist));
                    setInMyList(!inMyList);
                  }}
                  className={`p-3 sm:p-4 rounded-full border-2 transition-all ${inMyList ? 'bg-white border-white text-black' : 'bg-transparent border-white/60 hover:border-white text-white/80 hover:text-white'}`}
                >
                  {inMyList ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
                
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`p-3 sm:p-4 rounded-full border-2 transition-all ${liked ? 'bg-white border-white text-black' : 'bg-transparent border-white/60 hover:border-white text-white/80 hover:text-white'}`}
                >
                  {liked ? (
                    <ThumbsUp className="w-5 h-5 fill-current" />
                  ) : (
                    <ThumbsUp className="w-5 h-5" />
                  )}
                </button>
                
                <button 
                  className="p-3 sm:p-4 rounded-full border-2 border-white/60 hover:border-white bg-transparent hover:bg-black/50 text-white/80 hover:text-white transition-all"
                >
                  <ThumbsDown className="w-5 h-5" />
                </button>

                <button 
                  onClick={async () => {
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: content.title,
                          text: `Check out ${content.title}`,
                          url: typeof window !== 'undefined' ? window.location.origin + (isMovie ? `/movie/${content._id}` : `/series/${content._id}`) : '',
                        });
                      } catch (err) {
                        console.log('Share cancelled');
                      }
                    } else {
                      navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.origin + (isMovie ? `/movie/${content._id}` : `/series/${content._id}`) : '');
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="p-3 sm:p-4 rounded-full border-2 border-white/60 hover:border-white bg-transparent hover:bg-black/50 text-white/80 hover:text-white transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => setShowTrailer(true)}
                  className="p-3 sm:p-4 rounded-full border-2 border-white/60 hover:border-white bg-transparent hover:bg-black/50 text-white/80 hover:text-white transition-all"
                >
                  <Clapperboard className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 md:px-12 pb-8 pt-4 sm:pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              {content.description && (
                <div className="mb-6 sm:mb-8">
                  <p className="text-white text-sm sm:text-base leading-relaxed">
                    {content.description}
                  </p>
                </div>
              )}

              <div className="mb-6 sm:mb-8">
                <div className="text-sm sm:text-base">
                  <div className="mb-2">
                    <span className="text-white/60">Cast: </span>
                    <span className="text-white">Actors, Director</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-white/60">Genres: </span>
                    <span className="text-white">
                      {content.tags?.slice(0, 4).join(", ") || "Drama, Action"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">This show is: </span>
                    <span className="text-white">Suspenseful, Exciting</span>
                  </div>
                </div>
              </div>

              {content.seasons && content.seasons.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">Seasons</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.seasons.map((season) => (
                      <Link
                        key={season.seasonNumber}
                        href={`/series/${String(content._id)}`}
                        onClick={onClose}
                        className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded transition-colors text-center"
                      >
                        <span className="text-white font-medium text-sm">Season {season.seasonNumber}</span>
                        <p className="text-white/60 text-xs mt-0.5">{season.episodes.length} Episodes</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <div className="mb-4">
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="text-white/60">Release Year: </span>
                    <span className="text-white">{content.year || "N/A"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-white/60">Language: </span>
                    <span className="text-white">{content.language || "Telugu"}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-white/60">Rating: </span>
                    <span className="text-white">{content.rating || "N/A"}/10</span>
                  </div>
                  <div>
                    <span className="text-white/60">Quality: </span>
                    <span className="text-white">{content.quality || "HD"}</span>
                  </div>
                </div>
              </div>

              {content.tags && content.tags.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3 text-sm sm:text-base">More Like This</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.slice(0, 6).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-[#333] hover:bg-[#444] text-white/80 text-sm rounded transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
                  <Info className="w-4 h-4" />
                  <span>Details</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trailer Modal */}
        {showTrailer && (
          <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-full aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed?list=search&search_query=${encodeURIComponent(content.title + ' trailer')}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
