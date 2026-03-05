"use client";

import { useState } from "react";
import { Play, AlertCircle } from "lucide-react";

interface IframePlayerProps {
  src?: string;
  title: string;
}

export default function IframePlayer({ src, title }: IframePlayerProps) {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-[#141414] rounded-2xl border border-[#222] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Watch Link Not Available</h3>
          <p className="text-gray-500">This content does not have a streaming link yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#222]">
      {hasError && (
        <div className="absolute inset-0 bg-[#141414] flex items-center justify-center z-10">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Video</h3>
            <p className="text-gray-500">Please try again later or check your connection.</p>
          </div>
        </div>
      )}

      <iframe
        src={src}
        title={title}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
