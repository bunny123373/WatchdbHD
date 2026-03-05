export const LANGUAGES = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Malayalam",
  "Kannada",
  "English",
  "Korean",
  "Japanese",
  "Chinese",
  "Spanish",
  "Dubbed",
] as const;

export const AUDIO_LANGUAGES = [
  "Telugu",
  "Hindi",
  "English",
  "Tamil",
  "Malayalam",
  "Kannada",
] as const;

export const CATEGORIES = [
  "Trending",
  "Latest",
  "Dubbed",
  "Movies",
  "Web Series",
  "Top Rated",
  "Popular",
] as const;

export const QUALITIES = ["480p", "720p", "1080p", "1440p", "4K"] as const;

export const TMDB_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 35, name: "Comedy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
  { id: 16, name: "Animation" },
  { id: 14, name: "Fantasy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 36, name: "History" },
  { id: 10402, name: "Music" },
  { id: 18, name: "Drama" },
  { id: 10770, name: "TV Movie" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
] as const;

export const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "series", label: "Series" },
] as const;

export const SITE_CONFIG = {
  name: "WatchTMDB",
  brandName: "WatchTMDB HD",
  tagline: "Watch. Download. Stream Premium Cinema.",
  description: "Your ultimate destination for Telugu movies, Hindi dubbed films, and web series. Stream and download premium cinema content in HD quality free.",
  url: "https://watchdbhd.vercel.app",
  keywords: [
    "telugu movies",
    "hindi dubbed movies",
    "web series",
    "telugu hd movies",
    "new releases",
    "free streaming",
    "download movies",
    "tamil movies",
    "malayalam movies",
    "english movies",
    "korean dramas",
    "tv shows",
    "ott platform",
    "cinema",
    "hd movies",
  ],
  ogImage: "/og-image.jpg",
} as const;
