"use client";

import { ExternalLink } from "lucide-react";

interface IframePlayerProps {
  src?: string;
  title: string;
}

export default function IframePlayer({ src, title }: IframePlayerProps) {
  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  let embedUrl = src.trim();
  
  if (embedUrl.startsWith("//")) {
    embedUrl = "https:" + embedUrl;
  } else if (!embedUrl.startsWith("http://") && !embedUrl.startsWith("https://")) {
    embedUrl = "https://" + embedUrl;
  }

  return (
    <div className="w-full aspect-video bg-black flex items-center justify-center">
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-4 px-8 py-6 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        <ExternalLink className="w-12 h-12 text-white" />
        <span className="text-white font-medium text-lg">Watch Now</span>
        <span className="text-gray-400 text-sm">Click to open in new tab</span>
      </a>
    </div>
  );
}
