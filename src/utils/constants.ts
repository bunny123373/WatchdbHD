export const LANGUAGES = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Malayalam",
  "English",
] as const;

export const CATEGORIES = [
  "Trending",
  "Latest",
  "Dubbed",
  "Movies",
  "Web Series",
] as const;

export const QUALITIES = ["480p", "720p", "1080p", "4K"] as const;

export const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
] as const;

export const SITE_CONFIG = {
  name: "WatchTMDB",
  brandName: "WatchTMDB",
  tagline: "Watch. Download. Stream Premium Cinema.",
  description: "Your ultimate destination for Telugu movies and web series. Stream and download premium cinema content.",
  url: "https://watchtmdb.netlify.app",
  ogImage: "/og-image.jpg",
} as const;
