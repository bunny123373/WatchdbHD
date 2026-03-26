"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface PlayerjsEmbedProps {
  file: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  start?: number;
  end?: number;
  duration?: number;
  subtitle?: string;
  id?: string;
  className?: string;
  onEvent?: (event: string, data?: unknown) => void;
}

declare global {
  interface Window {
    Playerjs: new (options: PlayerjsOptions) => PlayerjsInstance;
    PlayerjsAsync?: () => void;
  }
}

interface PlayerjsOptions {
  id: string;
  file?: string;
  poster?: string;
  title?: string;
  autoplay?: number;
  start?: number;
  end?: number;
  duration?: number;
  subtitle?: string;
  default_audio?: string;
  rename_audio?: Record<string, string>;
}

interface PlayerjsInstance {
  api: (action: string, value?: unknown) => unknown;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
  getTime: () => number;
  setTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  getPaused: () => boolean;
  getDuration: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  getMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  getQualities: () => string[];
  getCurrentQuality: () => number;
  setCurrentQuality: (index: number) => void;
  getAudioTracks: () => AudioTrackInfo[];
  getCurrentAudioTrack: () => number;
  setCurrentAudioTrack: (index: number) => void;
  getSources: () => SourceInfo[];
  getCurrentSource: () => number;
  setCurrentSource: (index: number) => void;
  destroy: () => void;
}

interface AudioTrackInfo {
  id: number;
  name: string;
  lang?: string;
  url?: string;
  default?: boolean;
}

interface SourceInfo {
  name: string;
  url: string;
  quality?: string;
}

const DEFAULT_PLAYERJS_URL = "//playerjs.com/playerjs.js";

export default function PlayerjsEmbed({
  file,
  poster,
  title,
  autoplay = false,
  start,
  end,
  duration,
  subtitle,
  id = "player",
  className = "w-full aspect-video",
  onEvent,
}: PlayerjsEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerjsInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadPlayerjs = () => {
      if (window.Playerjs) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = DEFAULT_PLAYERJS_URL;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => setError(true);
      document.head.appendChild(script);
    };

    loadPlayerjs();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
        }
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.Playerjs) return;

    try {
      playerRef.current = new window.Playerjs({
        id,
        file,
        poster,
        title,
        autoplay: autoplay ? 1 : 0,
        start,
        end,
        duration,
        subtitle,
      });

      if (onEvent && playerRef.current) {
        const events = ["play", "pause", "end", "time", "volume", "buffering", "buffered", "error", "quality", "audioTrack", "source"];
        events.forEach((event) => {
          playerRef.current?.on(event, (data) => {
            onEvent(event, data);
          });
        });
      }
    } catch (e) {
      console.error("Playerjs initialization error:", e);
      setError(true);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
        }
        playerRef.current = null;
      }
    };
  }, [isLoaded, id, file, poster, title, autoplay, start, end, duration, subtitle, onEvent]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !window.Playerjs || !file) return;

    const initPlayer = () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
        }
        playerRef.current = null;
      }

      try {
        playerRef.current = new window.Playerjs({
          id,
          file,
          poster,
          title,
          autoplay: autoplay ? 1 : 0,
          start,
          end,
          duration,
          subtitle,
        });
      } catch (e) {
        console.error("Playerjs reinitialization error:", e);
      }
    };

    const timeoutId = setTimeout(initPlayer, 100);
    return () => clearTimeout(timeoutId);
  }, [file]);

  if (error) {
    return (
      <div className={`${className} bg-black flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-gray-400 mb-3">Failed to load player</p>
          <button
            onClick={() => {
              setError(false);
              setIsLoaded(false);
            }}
            className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} bg-black relative`}>
      <div
        ref={containerRef}
        id={id}
        className="w-full h-full"
        style={{ minHeight: "100%" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-pulse text-gray-500">Loading player...</div>
        </div>
      )}
    </div>
  );
}

export function usePlayerjs(playerRef: React.RefObject<PlayerjsInstance | null>) {
  const api = useCallback((action: string, value?: unknown) => {
    return playerRef.current?.api(action, value);
  }, [playerRef]);

  const play = useCallback(() => {
    playerRef.current?.play();
  }, [playerRef]);

  const pause = useCallback(() => {
    playerRef.current?.pause();
  }, [playerRef]);

  const getTime = useCallback(() => {
    return playerRef.current?.getTime() ?? 0;
  }, [playerRef]);

  const setTime = useCallback((time: number) => {
    playerRef.current?.setTime(time);
  }, [playerRef]);

  const getVolume = useCallback(() => {
    return playerRef.current?.getVolume() ?? 1;
  }, [playerRef]);

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume);
  }, [playerRef]);

  const getQualities = useCallback(() => {
    return playerRef.current?.getQualities() ?? [];
  }, [playerRef]);

  const getCurrentQuality = useCallback(() => {
    return playerRef.current?.getCurrentQuality() ?? 0;
  }, [playerRef]);

  const setCurrentQuality = useCallback((index: number) => {
    playerRef.current?.setCurrentQuality(index);
  }, [playerRef]);

  const getAudioTracks = useCallback(() => {
    return playerRef.current?.getAudioTracks() ?? [];
  }, [playerRef]);

  const getCurrentAudioTrack = useCallback(() => {
    return playerRef.current?.getCurrentAudioTrack() ?? 0;
  }, [playerRef]);

  const setCurrentAudioTrack = useCallback((index: number) => {
    playerRef.current?.setCurrentAudioTrack(index);
  }, [playerRef]);

  const getSources = useCallback(() => {
    return playerRef.current?.getSources() ?? [];
  }, [playerRef]);

  const getCurrentSource = useCallback(() => {
    return playerRef.current?.getCurrentSource() ?? 0;
  }, [playerRef]);

  const setCurrentSource = useCallback((index: number) => {
    playerRef.current?.setCurrentSource(index);
  }, [playerRef]);

  return {
    api,
    play,
    pause,
    getTime,
    setTime,
    getVolume,
    setVolume,
    getQualities,
    getCurrentQuality,
    setCurrentQuality,
    getAudioTracks,
    getCurrentAudioTrack,
    setCurrentAudioTrack,
    getSources,
    getCurrentSource,
    setCurrentSource,
  };
}
