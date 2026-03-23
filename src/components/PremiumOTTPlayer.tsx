"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import Hls from "hls.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, Subtitles, SkipForward as SkipIntroIcon,
  X, ChevronDown
} from "lucide-react";
import { IContent } from "@/models/Content";

interface PremiumOTTPlayerProps {
  src: string;
  content: IContent;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
}

interface AudioTrack {
  id: string;
  language: string;
  label: string;
}

interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  kind: string;
}

interface QualityLevel {
  height: number;
  label: string;
}

interface ContinueWatchingItem {
  contentId: string;
  progress: number;
  timestamp: number;
  content: IContent;
}

const STORAGE_KEY = "watchProgressFull";
const INTRO_DURATION = 90;

export default function PremiumOTTPlayer({ 
  src, 
  content, 
  onEnded, 
  onProgress 
}: PremiumOTTPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(0);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"audio" | "subtitle" | "quality" | "speed">("audio");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const getContinueWatching = useCallback((): ContinueWatchingItem[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const saveProgress = useCallback((progress: number) => {
    if (typeof window === "undefined" || !content._id) return;
    const progressData = getContinueWatching();
    const filtered = progressData.filter((p: ContinueWatchingItem) => p.contentId !== String(content._id));
    const newData: ContinueWatchingItem[] = [
      ...filtered,
      {
        contentId: String(content._id),
        progress,
        timestamp: Date.now(),
        content
      }
    ].sort((a: ContinueWatchingItem, b: ContinueWatchingItem) => b.timestamp - a.timestamp).slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    onProgress?.(progress);
  }, [content, getContinueWatching, onProgress]);

  const getResumePosition = useCallback((): number => {
    const progressData = getContinueWatching();
    const item = progressData.find((p: ContinueWatchingItem) => p.contentId === String(content._id));
    if (item && item.progress > 0 && item.progress < 95) {
      return item.progress;
    }
    return 0;
  }, [content._id, getContinueWatching]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    setShowMobileControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
        setShowMobileControls(false);
        setShowSettings(false);
      }, 3000);
    }
  }, [isPlaying]);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const initializePlayer = useCallback(() => {
    if (!videoRef.current || !src) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-fill");
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      autoplay: "any",
      controls: false,
      responsive: true,
      fluid: false,
      preload: "auto",
      html5: {
        vhs: {
          overrideNative: true,
          enableLowInitialPlaylist: true
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      },
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      poster: content.poster
    });

    player.ready(() => {
      playerRef.current = player as unknown as Player;
      setIsLoading(false);
    });

    player.on("loadedmetadata", () => {
      const dur = player.duration();
      setDuration(dur || 0);
      const resumePos = getResumePosition();
      if (resumePos > 0 && dur) {
        player.currentTime((dur * resumePos) / 100);
      }
      setIsLoading(false);
    });

    player.on("play", () => setIsPlaying(true));
    player.on("pause", () => setIsPlaying(false));
    player.on("timeupdate", () => {
      const currTime = player.currentTime() ?? 0;
      const dur = player.duration();
      setCurrentTime(currTime);
      if (dur && dur > 0) {
        const progress = (currTime / dur) * 100;
        saveProgress(progress);
      }
    });

    if (Hls.isSupported() && src.includes(".m3u8")) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(player.el() as HTMLVideoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const tracks: AudioTrack[] = [];
        const audioTracksData = hls.audioTracks;
        if (audioTracksData) {
          for (let i = 0; i < audioTracksData.length; i++) {
            const track = audioTracksData[i];
            tracks.push({
              id: `audio-${i}`,
              language: track.lang || "und",
              label: track.name || `Track ${i + 1}`,
            });
          }
        }
        setAudioTracks(tracks);

        const qualities: QualityLevel[] = [];
        const levels = hls.levels;
        if (levels) {
          for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            qualities.push({
              height: level.height,
              label: level.height >= 1080 ? "1080p" : level.height >= 720 ? "720p" : "480p"
            });
          }
        }
        setQualityLevels(qualities);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        setCurrentQuality(data.level);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Failed to load video stream");
        }
      });

      player.on("loadedmetadata", () => {
        const subtitles: SubtitleTrack[] = [];
        const textTracks = player.textTracks() as unknown as Array<{kind?: string; language?: string; label?: string}>;
        if (textTracks) {
          textTracks.forEach((track, i) => {
            if (track.kind === "subtitles" || track.kind === "captions") {
              subtitles.push({
                id: `subtitle-${i}`,
                language: track.language || "und",
                label: track.label || `Subtitle ${i + 1}`,
                kind: track.kind || "subtitles"
              });
            }
          });
        }
        setSubtitleTracks(subtitles);
      });
    } else {
      player.src({ src, type: src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4" });
    }

    player.on("ended", () => {
      setIsPlaying(false);
      onEnded?.();
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, content.poster, getResumePosition, saveProgress, onEnded]);

  useEffect(() => {
    const cleanup = initializePlayer();
    return () => cleanup?.();
  }, [initializePlayer]);

  useEffect(() => {
    if (currentTime > INTRO_DURATION && !showSkipIntro) {
      setShowSkipIntro(true);
    }
    if (currentTime <= INTRO_DURATION) {
      setShowSkipIntro(false);
    }
  }, [currentTime, showSkipIntro]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const seekRelative = (seconds: number) => {
    if (!playerRef.current) return;
    const currTime = playerRef.current.currentTime() ?? 0;
    const newTime = Math.max(0, Math.min(duration, currTime + seconds));
    playerRef.current.currentTime(newTime);
    showControlsTemporarily();
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    playerRef.current.muted(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerRef.current.currentTime(percent * duration);
    showControlsTemporarily();
  };

  const switchAudioTrack = (index: number) => {
    if (hlsRef.current && hlsRef.current.audioTracks) {
      hlsRef.current.audioTrack = index;
      setCurrentAudioTrack(index);
    }
  };

  const switchSubtitle = (index: number) => {
    if (!playerRef.current) return;
    const textTracks = playerRef.current.textTracks() as unknown as Array<{mode?: string}>;
    if (textTracks) {
      for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i]) {
          textTracks[i].mode = i === index ? "showing" : "disabled";
        }
      }
    }
    setCurrentSubtitleTrack(index);
  };

  const switchQuality = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index;
      setCurrentQuality(index);
    }
  };

  const changePlaybackRate = (rate: number) => {
    if (playerRef.current) {
      playerRef.current.playbackRate(rate);
      setPlaybackRate(rate);
    }
  };

  const skipIntro = () => {
    if (!playerRef.current) return;
    playerRef.current.currentTime(Math.min(duration, INTRO_DURATION));
    setShowSkipIntro(false);
    showControlsTemporarily();
  };

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0];
    const diffX = touchStart.x - touchEnd.clientX;
    const diffY = Math.abs(touchStart.y - touchEnd.clientY);
    const timeDiff = Date.now() - touchStart.time;
    
    if (Math.abs(diffX) > 50 && timeDiff < 500 && diffY < 30) {
      if (diffX > 0) {
        seekRelative(10);
      } else {
        seekRelative(-10);
      }
    } else if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10 && timeDiff < 300) {
      if (!playerRef.current) return;
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
      showControlsTemporarily();
    }
    setTouchStart(null);
  };

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
    showControlsTemporarily();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
        <div className="text-center p-4 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white/30" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Stream Available</h3>
          <p className="text-white/40 text-sm">This content does not have a direct stream yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full bg-black rounded-2xl overflow-hidden group md:rounded-xl"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        ref={videoRef} 
        className="w-full aspect-video cursor-pointer"
        onClick={handleTap}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center px-4">
            <p className="text-white/60 mb-3 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute inset-0 flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronDown className="w-5 h-5 text-white rotate-90" />
              </button>
            </div>
            <h3 className="text-white text-sm sm:text-base font-medium truncate max-w-[60%] sm:max-w-[40%]">
              {content.title}
            </h3>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex items-center justify-center">
            {!isPlaying && !isLoading && (
              <button
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all duration-200"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1" fill="white" />
              </button>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

            {showSkipIntro && (
              <button
                onClick={skipIntro}
                className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#e50914] text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-[#f60] transition-colors flex items-center gap-1.5 animate-bounce"
              >
                <SkipIntroIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Skip Intro</span>
                <span className="sm:hidden">Skip</span>
              </button>
            )}

            <div className="relative z-10 px-2 sm:px-4 pb-2 sm:pb-4 pt-8 sm:pt-12">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-white/80 text-xs sm:text-sm font-medium tabular-nums">
                  {formatTime(currentTime)}
                </span>
                <span className="text-white/80 text-xs sm:text-sm font-medium tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>

              <div 
                className="relative h-1.5 sm:h-2 bg-white/20 rounded-full cursor-pointer group/progress mb-2 sm:mb-3"
                onClick={handleProgressClick}
              >
                <div 
                  className="absolute h-full bg-[#e50914] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
                <div 
                  className="absolute w-3 h-3 sm:w-4 sm:h-4 bg-[#e50914] rounded-full -top-0.5 sm:-top-1 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button 
                    onClick={togglePlay} 
                    className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </button>

                  <button onClick={() => seekRelative(-10)} className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg transition-colors hidden sm:flex">
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>

                  <button onClick={() => seekRelative(10)} className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg transition-colors hidden sm:flex">
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>

                  <div className="hidden md:flex items-center gap-2">
                    <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-5 h-5 text-white" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="relative">
                    <button 
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
                    >
                      <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 sm:left-0 mb-2 w-56 sm:w-72 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl z-50 max-h-[70vh]">
                        <div className="flex border-b border-white/10">
                          {(["audio", "subtitle", "quality", "speed"] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`flex-1 py-2.5 px-1 sm:px-3 text-xs font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab 
                                  ? "text-[#e50914] bg-white/5" 
                                  : "text-white/50 hover:text-white"
                              }`}
                            >
                              {tab === "audio" ? "Audio" : tab === "subtitle" ? "Subs" : tab === "quality" ? "Quality" : "Speed"}
                            </button>
                          ))}
                        </div>

                        <div className="max-h-48 sm:max-h-60 overflow-y-auto p-2">
                          {activeTab === "audio" && (
                            <div className="space-y-1">
                              {audioTracks.length > 0 ? audioTracks.map((track, index) => (
                                <button
                                  key={track.id}
                                  onClick={() => { switchAudioTrack(index); setShowSettings(false); }}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-colors ${
                                    currentAudioTrack === index 
                                      ? "bg-[#e50914] text-white" 
                                      : "text-white/70 hover:bg-white/10"
                                  }`}
                                >
                                  <span>{track.label}</span>
                                  {currentAudioTrack === index && <span className="text-xs">✓</span>}
                                </button>
                              )) : (
                                <p className="text-white/40 text-sm text-center py-4">No audio tracks</p>
                              )}
                            </div>
                          )}

                          {activeTab === "subtitle" && (
                            <div className="space-y-1">
                              <button
                                onClick={() => { switchSubtitle(-1); setShowSettings(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-colors ${
                                  currentSubtitleTrack === -1 
                                    ? "bg-[#e50914] text-white" 
                                    : "text-white/70 hover:bg-white/10"
                                }`}
                              >
                                <span className="flex items-center gap-2">Off</span>
                                {currentSubtitleTrack === -1 && <span className="text-xs">✓</span>}
                              </button>
                              {subtitleTracks.map((track, index) => (
                                <button
                                  key={track.id}
                                  onClick={() => { switchSubtitle(index); setShowSettings(false); }}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-colors ${
                                    currentSubtitleTrack === index 
                                      ? "bg-[#e50914] text-white" 
                                      : "text-white/70 hover:bg-white/10"
                                  }`}
                                >
                                  <span>{track.label}</span>
                                  {currentSubtitleTrack === index && <span className="text-xs">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}

                          {activeTab === "quality" && (
                            <div className="space-y-1">
                              <button
                                onClick={() => { switchQuality(-1); setShowSettings(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-colors ${
                                  currentQuality === -1 
                                    ? "bg-[#e50914] text-white" 
                                    : "text-white/70 hover:bg-white/10"
                                }`}
                              >
                                <span>Auto</span>
                                {currentQuality === -1 && <span className="text-xs">✓</span>}
                              </button>
                              {qualityLevels.map((level, index) => (
                                <button
                                  key={index}
                                  onClick={() => { switchQuality(index); setShowSettings(false); }}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-colors ${
                                    currentQuality === index 
                                      ? "bg-[#e50914] text-white" 
                                      : "text-white/70 hover:bg-white/10"
                                  }`}
                                >
                                  <span>{level.label}</span>
                                  {currentQuality === index && <span className="text-xs">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}

                          {activeTab === "speed" && (
                            <div className="space-y-1">
                              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => { changePlaybackRate(rate); setShowSettings(false); }}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-lg text-sm transition-colors ${
                                    playbackRate === rate 
                                      ? "bg-[#e50914] text-white" 
                                      : "text-white/70 hover:bg-white/10"
                                  }`}
                                >
                                  <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                                  {playbackRate === rate && <span className="text-xs">✓</span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={toggleFullscreen}
                    className="p-2 sm:p-2.5 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto flex items-center justify-center"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}