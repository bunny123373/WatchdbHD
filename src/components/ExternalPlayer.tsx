"use client";

import { useEffect, useId } from "react";

interface ExternalPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  autoplay?: boolean;
  start?: number;
  end?: number;
  duration?: number;
  subtitle?: string;
  playerUrl?: string;
}

export default function ExternalPlayer({
  src,
  poster,
  title,
  autoplay = false,
  start,
  end,
  duration,
  subtitle,
  playerUrl = "//site.com/playerjs.js",
}: ExternalPlayerProps) {
  const containerId = useId();

  useEffect(() => {
    if (!src) return;

    const existingScript = document.querySelector(`script[src="${playerUrl}"]`);
    
    const initPlayer = () => {
      if ((window as any).Playerjs) {
        new (window as any).Playerjs({
          id: containerId,
          file: src,
          poster: poster,
          title: title,
          autoplay: autoplay ? 1 : 0,
          start: start,
          end: end,
          duration: duration,
          subtitle: subtitle,
        });
      } else if ((window as any).playerjs) {
        new (window as any).playerjs({
          id: containerId,
          file: src,
          poster: poster,
          title: title,
          autoplay: autoplay ? 1 : 0,
          start: start,
          end: end,
          duration: duration,
          subtitle: subtitle,
        });
      }
    };

    if (existingScript) {
      if (document.readyState === "complete") {
        initPlayer();
      } else {
        window.addEventListener("load", initPlayer);
        return () => window.removeEventListener("load", initPlayer);
      }
    } else {
      const script = document.createElement("script");
      script.src = playerUrl;
      script.async = true;
      script.type = "text/javascript";

      script.onload = () => {
        console.log("External player script loaded");
        initPlayer();
      };

      document.body.appendChild(script);

      return () => {
        const scriptToRemove = document.querySelector(`script[src="${playerUrl}"]`);
        if (scriptToRemove && !document.querySelectorAll(`script[src="${playerUrl}"]`).length) {
          // Keep the script loaded for potential reuse
        }
      };
    }
  }, [src, poster, title, autoplay, start, end, duration, subtitle, playerUrl, containerId]);

  if (!src) {
    return null;
  }

  return (
    <div
      id={containerId}
      className="w-full aspect-video bg-black"
    />
  );
}