"use client";

import { useState } from "react";
import { Video, Loader2, Check, AlertCircle, Link, Zap } from "lucide-react";
import Button from "@/components/ui/Button";

interface VideoConverterProps {
  onHlsGenerated?: (hlsUrl: string) => void;
}

interface AudioTrack {
  language: string;
  name: string;
  codec: string;
}

export default function VideoConverter({ onHlsGenerated }: VideoConverterProps) {
  const [mp4Url, setMp4Url] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; hlsUrl?: string; error?: string; audioTracks?: AudioTrack[] } | null>(null);

  const handleConvert = async () => {
    if (!mp4Url) return;

    setIsConverting(true);
    setResult(null);

    try {
      const response = await fetch("/api/upload-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mp4Url }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ 
          success: true, 
          hlsUrl: data.hlsUrl,
          audioTracks: data.audioTracks 
        });
        onHlsGenerated?.(data.hlsUrl);
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      setResult({ success: false, error: "Failed to convert video" });
    } finally {
      setIsConverting(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return url.endsWith(".mp4") || url.includes("archive.org") || url.includes("download");
    } catch {
      return false;
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-yellow-500" />
        <h3 className="text-white font-medium">Quick HLS Convert</h3>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">
        Paste an MP4 URL to automatically convert to HLS with audio track support.
      </p>

      <div className="flex gap-2">
        <input
          type="url"
          value={mp4Url}
          onChange={(e) => {
            setMp4Url(e.target.value);
            setResult(null);
          }}
          placeholder="https://example.com/video.mp4"
          className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-[#333] rounded text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-yellow-500"
        />
        <Button
          onClick={handleConvert}
          disabled={!isValidUrl(mp4Url) || isConverting}
          className="px-4 bg-yellow-500 hover:bg-yellow-600 text-black font-medium text-sm"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
              Converting...
            </>
          ) : (
            <>
              <Video className="w-4 h-4 mr-1" />
              Convert
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className={`mt-3 p-3 rounded ${result.success ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          {result.success ? (
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-400 text-sm font-medium">HLS Generated!</p>
                <p className="text-gray-400 text-xs mt-1 break-all">{result.hlsUrl}</p>
                <button
                  onClick={() => navigator.clipboard.writeText(result.hlsUrl || "")}
                  className="text-yellow-500 text-xs mt-2 hover:underline flex items-center gap-1"
                >
                  <Link className="w-3 h-3" /> Copy URL
                </button>
                
                {result.audioTracks && result.audioTracks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <p className="text-gray-400 text-xs mb-2">Audio Tracks ({result.audioTracks.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {result.audioTracks.map((track, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded"
                        >
                          {track.name} ({track.language})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-red-400 text-sm">{result.error}</p>
                {result.error?.includes("not configured") && (
                  <p className="text-gray-500 text-xs mt-1">
                    Add API_VIDEO_API_KEY to your .env.local file
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500">
        Powered by api.video - Free encoding, pay only for storage/delivery
      </div>
    </div>
  );
}