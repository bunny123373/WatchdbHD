"use client";

import { useState } from "react";
import { Download, Check, ChevronDown } from "lucide-react";
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
  const { addDownload, isDownloaded } = useDownloads();

  const downloadOptions: DownloadOption[] = qualities.length > 0 
    ? qualities
    : url ? [{ url, quality: "HD" }] : [];

  const handleDownload = async (option: DownloadOption) => {
    if (!isDirectFileUrl(option.url)) {
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

  if (downloadOptions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => !downloaded && (downloadOptions.length > 1 ? setShowMenu(!showMenu) : handleDownload(downloadOptions[0]))}
        disabled={downloading || downloaded}
        className={`${className} ${downloaded ? "bg-green-600 hover:bg-green-700" : ""}`}
      >
        {downloading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Downloading...</span>
          </span>
        ) : downloaded ? (
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Downloaded</span>
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
