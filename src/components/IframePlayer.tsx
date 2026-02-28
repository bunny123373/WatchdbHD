"use client";

import { useState } from "react";
import { Play, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface IframePlayerProps {
  src?: string; // Embed URL for the video player
  title: string; // Video title for accessibility
}

export default function IframePlayer({ src, title }: IframePlayerProps) {
  // State to track loading status of the iframe
  const [isLoading, setIsLoading] = useState(true);
  // State to track if video failed to load
  const [hasError, setHasError] = useState(false);

  // Handle case when no streaming link is available
  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-card rounded-2xl border border-border flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">Watch Link Not Available</h3>
          <p className="text-text-muted">This content does not have a streaming link yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-border shadow-2xl">
      {/* Loading Skeleton - Shows while iframe is loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          className="absolute inset-0 bg-card flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary-gold/30 border-t-primary-gold animate-spin mx-auto mb-4" />
            <p className="text-text-muted">Loading player...</p>
          </div>
        </motion.div>
      )}

      {/* Error State - Shows if video fails to load */}
      {hasError && (
        <div className="absolute inset-0 bg-card flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Failed to Load Video</h3>
            <p className="text-text-muted">Please try again later or check your connection.</p>
          </div>
        </div>
      )}

      {/* Video Iframe - Embeds the streaming player */}
      <iframe
        src={src}
        title={title}
        className="w-full h-full"
        allowFullScreen
        // Required permissions for video playback
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
