"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import Hls from "hls.js";
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, Subtitles, ChevronLeft,
  Check, SkipForward as SkipIntroIcon
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
  kind: string;
}

interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  kind: string;
  default?: boolean;
}

interface QualityLevel {
  height: number;
  bitrate: number;
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
  const lastClickTime = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
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
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
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
    videoElement.classList.add("vjs-fill", "vjs-big-play-centered", "vjs-theme-watchmirror");
    videoElement.style.width = "100%";
    videoElement.style.height = "100%";
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      autoplay: false,
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
    }, () => {
      playerRef.current = player;
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
              kind: "alternative"
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
              bitrate: level.bitrate,
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
        const textTracks = player.textTracks() as unknown as Array<{kind?: string; language?: string; label?: string; default?: boolean}>;
        if (textTracks) {
          textTracks.forEach((track, i) => {
            if (track.kind === "subtitles" || track.kind === "captions") {
              subtitles.push({
                id: `subtitle-${i}`,
                language: track.language || "und",
                label: track.label || `Subtitle ${i + 1}`,
                kind: track.kind || "subtitles",
                default: track.default
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
    if (!isPlaying && showControls) {
      if (hideControlsTimer.current) {
        clearTimeout(hideControlsTimer.current);
      }
    }
  }, [isPlaying, showControls]);

  useEffect(() => {
    if (currentTime > INTRO_DURATION && !showSkipIntro) {
      setShowSkipIntro(true);
    }
    if (currentTime <= INTRO_DURATION) {
      setShowSkipIntro(false);
    }
  }, [currentTime, showSkipIntro]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!playerRef.current) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          seekRelative(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "Escape":
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

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

  const adjustVolume = (delta: number) => {
    if (!playerRef.current) return;
    const newVolume = Math.max(0, Math.min(1, volume + delta));
    playerRef.current.volume(newVolume);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (playerRef.current) {
      playerRef.current.volume(newVolume);
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const switchAudioTrack = (index: number) => {
    if (hlsRef.current && hlsRef.current.audioTracks) {
      hlsRef.current.audioTracks.forEach((track, i) => {
        track.forced = i === index;
      });
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      toggleFullscreen();
    }
    lastClickTime.current = now;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Play className="w-10 h-10 text-white/30" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Stream Available</h3>
          <p className="text-white/40 text-sm">This content does not have a direct stream yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full bg-black rounded-2xl overflow-hidden group"
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onDoubleClick={handleDoubleClick}
    >
      <div ref={videoRef} className="w-full aspect-video" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-white/60 mb-3">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300"
        >
          <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform duration-300">
            <Play className="w-12 h-12 text-white ml-1" />
          </div>
        </button>
      )}

      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
          isPlaying && !showControls ? "opacity-0" : "opacity-100"
        }`}
      >
        {isPlaying && (
          <button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform duration-300 pointer-events-auto"
          >
            <Pause className="w-10 h-10 text-white" />
          </button>
        )}
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        <div className="relative z-10 px-4 pb-4 pt-16">
          {showSkipIntro && (
            <button
              onClick={skipIntro}
              className="absolute left-1/2 -translate-x-1/2 -top-12 px-4 py-2 bg-[#e50914] text-white text-sm font-medium rounded-lg hover:bg-[#f60] transition-colors flex items-center gap-2 animate-bounce"
            >
              <SkipIntroIcon className="w-4 h-4" />
              Skip Intro
            </button>
          )}

          <div 
            className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            <div 
              className="absolute h-full bg-white/40 rounded-full"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div 
              className="absolute h-full bg-[#e50914] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
            <div 
              className="absolute w-4 h-4 bg-[#e50914] rounded-full -top-1 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
              </button>

              <button onClick={() => seekRelative(-10)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <SkipBack className="w-5 h-5 text-white" />
              </button>

              <button onClick={() => seekRelative(10)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <SkipForward className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover:w-20 transition-all duration-300 h-1 accent-white bg-white/30 rounded-full cursor-pointer"
                />
              </div>

              <span className="text-white/80 text-sm font-medium tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>

                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-72 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    <div className="flex border-b border-white/10">
                      {(["audio", "subtitle", "quality", "speed"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-3 text-xs font-medium transition-colors ${
                            activeTab === tab 
                              ? "text-[#e50914] bg-white/5" 
                              : "text-white/50 hover:text-white"
                          }`}
                        >
                          {tab === "audio" ? "Audio" : tab === "subtitle" ? "Subtitles" : tab === "quality" ? "Quality" : "Speed"}
                        </button>
                      ))}
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2">
                      {activeTab === "audio" && (
                        <div className="space-y-1">
                          {audioTracks.length > 0 ? audioTracks.map((track, index) => (
                            <button
                              key={track.id}
                              onClick={() => switchAudioTrack(index)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                currentAudioTrack === index 
                                  ? "bg-[#e50914] text-white" 
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span>{track.label}</span>
                              {currentAudioTrack === index && <Check className="w-4 h-4" />}
                            </button>
                          )) : (
                            <p className="text-white/40 text-sm text-center py-4">No audio tracks available</p>
                          )}
                        </div>
                      )}

                      {activeTab === "subtitle" && (
                        <div className="space-y-1">
                          <button
                            onClick={() => switchSubtitle(-1)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              currentSubtitleTrack === -1 
                                ? "bg-[#e50914] text-white" 
                                : "text-white/70 hover:bg-white/10"
                            }`}
                          >
                            <span className="flex items-center gap-2"><Subtitles className="w-4 h-4" /> Off</span>
                            {currentSubtitleTrack === -1 && <Check className="w-4 h-4" />}
                          </button>
                          {subtitleTracks.map((track, index) => (
                            <button
                              key={track.id}
                              onClick={() => switchSubtitle(index)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                currentSubtitleTrack === index 
                                  ? "bg-[#e50914] text-white" 
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span>{track.label}</span>
                              {currentSubtitleTrack === index && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {activeTab === "quality" && (
                        <div className="space-y-1">
                          <button
                            onClick={() => switchQuality(-1)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                              currentQuality === -1 
                                ? "bg-[#e50914] text-white" 
                                : "text-white/70 hover:bg-white/10"
                            }`}
                          >
                            <span>Auto</span>
                            {currentQuality === -1 && <Check className="w-4 h-4" />}
                          </button>
                          {qualityLevels.map((level, index) => (
                            <button
                              key={index}
                              onClick={() => switchQuality(index)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                currentQuality === index 
                                  ? "bg-[#e50914] text-white" 
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span>{level.label}</span>
                              {currentQuality === index && <Check className="w-4 h-4" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {activeTab === "speed" && (
                        <div className="space-y-1">
                          {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                            <button
                              key={rate}
                              onClick={() => changePlaybackRate(rate)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                playbackRate === rate 
                                  ? "bg-[#e50914] text-white" 
                                  : "text-white/70 hover:bg-white/10"
                              }`}
                            >
                              <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                              {playbackRate === rate && <Check className="w-4 h-4" />}
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
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize className="w-5 h-5 text-white" /> : <Maximize className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}