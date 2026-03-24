"use client";

interface IframePlayerProps {
  src?: string;
  title: string;
  autoPlay?: boolean;
}

export default function IframePlayer({ src, title, autoPlay = false }: IframePlayerProps) {
  if (!src) {
    return (
      <div className="w-full aspect-video bg-black" />
    );
  }

  let embedUrl = src.trim();
  
  if (embedUrl.startsWith("//")) {
    embedUrl = "https:" + embedUrl;
  } else if (!embedUrl.startsWith("http://") && !embedUrl.startsWith("https://")) {
    embedUrl = "https://" + embedUrl;
  }

  const separator = embedUrl.includes("?") ? "&" : "?";
  if (autoPlay) {
    embedUrl = `${embedUrl}${separator}autoplay=1`;
  }

  return (
    <iframe
      src={embedUrl}
      title={title}
      className="w-full h-full"
      frameBorder={0}
      allowFullScreen
      allow="autoplay; encrypted-media"
    />
  );
}
