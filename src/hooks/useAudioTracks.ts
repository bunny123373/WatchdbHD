"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Hls from "hls.js";

export interface AudioTrack {
  id: number | string;
  name: string;
  lang?: string;
  kind?: string;
  url?: string;
  default?: boolean;
  language?: string;
  label?: string;
}

interface UseAudioTracksOptions {
  src?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  hlsInstance?: Hls | null;
}

interface UseAudioTracksReturn {
  tracks: AudioTrack[];
  activeTrackId: number;
  setActiveTrack: (trackId: number) => void;
  isLoading: boolean;
  error: string | null;
  hasAudioTracks: boolean;
}

export function useAudioTracks({
  src,
  videoRef,
  hlsInstance,
}: UseAudioTracksOptions): UseAudioTracksReturn {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hlsRef = useRef<Hls | null>(hlsInstance || null);

  useEffect(() => {
    if (hlsInstance) {
      hlsRef.current = hlsInstance;
    }
  }, [hlsInstance]);

  useEffect(() => {
    if (!src) {
      setTracks([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setTracks([]);

    const detectAudioTracks = () => {
      try {
        if (hlsRef.current && hlsRef.current.audioTracks) {
          const audioTracks = hlsRef.current.audioTracks;
          const formattedTracks: AudioTrack[] = audioTracks.map((track, index) => ({
            id: index,
            name: track.name || `Track ${index + 1}`,
            lang: track.lang,
            url: track.url,
            default: track.default,
          }));

          setTracks(formattedTracks);

          const activeIndex = hlsRef.current.audioTrack;
          setActiveTrackId(activeIndex);

          hlsRef.current.on(Hls.Events.AUDIO_TRACK_LOADED, () => {
            const updatedTracks = hlsRef.current?.audioTracks || [];
            setTracks(
              updatedTracks.map((track, index) => ({
                id: index,
                name: track.name || `Track ${index + 1}`,
                lang: track.lang,
                url: track.url,
                default: track.default,
              }))
            );
          });
        } else if (videoRef?.current) {
          const video = videoRef.current;
          const audioTracks = (video as any).audioTracks as any[];
          if (audioTracks && audioTracks.length > 0) {
            const formattedTracks: AudioTrack[] = audioTracks.map((track, index) => ({
              id: index,
              name: track.label || `Track ${index + 1}`,
              lang: track.language,
              default: track.default,
            }));

            setTracks(formattedTracks);

            const activeTrack = audioTracks.find((t: any) => t.enabled);
            if (activeTrack) {
              setActiveTrackId(audioTracks.indexOf(activeTrack));
            }
          }
        }
      } catch (err) {
        console.error("Error detecting audio tracks:", err);
        setError("Failed to detect audio tracks");
      } finally {
        setIsLoading(false);
      }
    };

    detectAudioTracks();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.off(Hls.Events.AUDIO_TRACK_LOADED);
      }
    };
  }, [src, videoRef]);

  const setActiveTrack = useCallback(
    (trackId: number) => {
      if (hlsRef.current && hlsRef.current.audioTracks) {
        hlsRef.current.audioTrack = trackId;
        setActiveTrackId(trackId);
      } else if (videoRef?.current) {
        const video = videoRef.current;
        const audioTracks = (video as any).audioTracks as any[];
        if (audioTracks) {
          for (let i = 0; i < audioTracks.length; i++) {
            audioTracks[i].enabled = i === trackId;
          }
          setActiveTrackId(trackId);
        }
      }
    },
    [videoRef]
  );

  return {
    tracks,
    activeTrackId,
    setActiveTrack,
    isLoading,
    error,
    hasAudioTracks: tracks.length > 1,
  };
}

export default useAudioTracks;