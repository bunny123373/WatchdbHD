"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, AlertCircle } from "lucide-react";
import Hls from "hls.js";

interface HlsPlayerProps {
  src?: string;
  title: string;
}

export default function HlsPlayer({ src, title }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;

    const loadHls = async () => {
      try {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setHasError(true);
            }
          });
        } else {
          setHasError(true);
        }
      } catch (error) {
        setHasError(true);
      }
    };

    loadHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent || 0);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-[#141414] rounded-2xl border border-[#222] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Stream Not Available</h3>
          <p className="text-gray-500">This content does not have an HLS stream yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#222] group">
      {hasError && (
        <div className="absolute inset-0 bg-[#141414] flex items-center justify-center z-10">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Stream</h3>
            <p className="text-gray-500">Please try again later or use iframe stream.</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={togglePlay} className="text-white hover:text-yellow-500 transition-colors">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={toggleMute} className="text-white hover:text-yellow-500 transition-colors">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button onClick={handleFullscreen} className="text-white hover:text-yellow-500 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
