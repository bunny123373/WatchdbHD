"use client";

import { useState } from "react";
import { Download, Check, ChevronDown, Loader2, ExternalLink } from "lucide-react";
import { isDirectFileUrl, downloadFile } from "@/utils/url";
import { useDownloads } from "@/hooks/useDownloads";

interface DownloadOption {
  url: string;
  quality: string;
}

interface DownloadButtonProps {
  url: string;
  title: string;
  poster?: string;
  type?: "movie" | "series";
  language?: string;
  qualities?: DownloadOption[];
  className?: string;
}

export default function DownloadButton({ 
  url, 
  title, 
  poster,
  type = "movie",
  language = "Telugu",
  qualities = [],
  className = "" 
}: DownloadButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null);
  const { addDownload } = useDownloads();

  const downloadOptions: DownloadOption[] = qualities.length > 0 
    ? qualities
    : url ? [{ url, quality: "HD" }] : [];

  const isEmbedUrl = url && !isDirectFileUrl(url);

  const handleExtractFromEmbed = async () => {
    if (!url) return;
    
    setExtracting(true);
    
    try {
      const response = await fetch("/api/extract-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        setExtractedUrl(data.url);
        downloadOptions.unshift({ url: data.url, quality: "Extracted" });
      } else {
        alert(data.error || "Could not extract video. Opening in new tab.");
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Extract error:", error);
      alert("Failed to extract video. Opening in new tab.");
      window.open(url, "_blank");
    } finally {
      setExtracting(false);
    }
  };

  const handleDownload = async (option: DownloadOption) => {
    if (!isDirectFileUrl(option.url)) {
      // Try to extract first if it's an embed
      if (isEmbedUrl && !extractedUrl) {
        await handleExtractFromEmbed();
        return;
      }
      window.open(option.url, "_blank");
      return;
    }

    setDownloading(true);
    const ext = getFileExtension(option.url) || ".mp4";
    
    await downloadFile(option.url, `${title}${ext}`);
    
    addDownload({
      id: `${title}-${option.quality}`,
      title,
      poster: poster || "",
      type,
      quality: option.quality,
      language,
    });
    
    setDownloaded(true);
    setDownloading(false);
    setShowMenu(false);
  };

  const getFileExtension = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const match = pathname.match(/\.([^.]+)$/);
      return match ? `.${match[1]}` : ".mp4";
    } catch {
      return ".mp4";
    }
  };

  if (downloadOptions.length === 0 && !isEmbedUrl) return null;

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (downloaded) return;
          if (isEmbedUrl) {
            handleExtractFromEmbed();
            return;
          }
          if (downloadOptions.length > 1) {
            setShowMenu(!showMenu);
          } else if (downloadOptions.length === 1) {
            handleDownload(downloadOptions[0]);
          }
        }}
        disabled={downloading || extracting || !!extractedUrl}
        className={`${className} ${downloaded ? "bg-green-600 hover:bg-green-700" : ""}`}
      >
        {downloading || extracting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{extracting ? "Extracting..." : "Downloading..."}</span>
          </span>
        ) : downloaded ? (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Downloaded</span>
          </span>
        ) : isEmbedUrl ? (
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Download</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        ) : downloadOptions.length > 1 ? (
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Download</span>
            <ChevronDown className="w-4 h-4" />
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Download</span>
          </span>
        )}
      </button>

      {showMenu && downloadOptions.length > 1 && (
        <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[160px] z-50">
          <div className="p-2 border-b border-[#333]">
            <span className="text-sm text-gray-400">Select Quality</span>
          </div>
          {downloadOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleDownload(option)}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#333] flex items-center justify-between"
            >
              <span>{option.quality}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
