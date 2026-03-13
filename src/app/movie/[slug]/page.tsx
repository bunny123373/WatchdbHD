import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Play, Plus, Info, Download, Star, Clock, Users, Film, Calendar, Globe } from "lucide-react";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { SITE_CONFIG } from "@/utils/constants";
import { normalizeExternalUrl } from "@/utils/url";

function resolveMovieIdFromSlug(slug: string) {
  const normalized = (slug || "").trim();
  if (!normalized) return normalized;

  const maybeId = normalized.split("-").pop() || normalized;
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(maybeId) ? maybeId : normalized;
}

async function getMovie(id: string) {
  try {
    await dbConnect();
    const movie = await Content.findById(id).lean() as unknown as Record<string, unknown> | null;
    if (!movie) return null;
    
    return {
      _id: String(movie._id || ""),
      title: String(movie.title || ""),
      poster: String(movie.poster || ""),
      banner: movie.banner ? String(movie.banner) : "",
      description: movie.description ? String(movie.description) : "",
      year: movie.year ? String(movie.year) : "",
      rating: movie.rating != undefined ? Number(movie.rating) : undefined,
      quality: movie.quality ? String(movie.quality) : "",
      language: movie.language ? String(movie.language) : "",
      audioLanguages: Array.isArray(movie.audioLanguages) ? movie.audioLanguages.map(String) : [],
      runtime: movie.runtime ? String(movie.runtime) : "",
      type: String(movie.type || "movie"),
      tags: Array.isArray(movie.tags) ? movie.tags.map(String) : [],
      seasons: Array.isArray(movie.seasons) ? movie.seasons : [],
      episodes: Array.isArray(movie.episodes) ? movie.episodes : [],
      category: movie.category ? String(movie.category) : "",
      tmdbId: movie.tmdbId != undefined ? Number(movie.tmdbId) : undefined,
      tmdbGenreIds: Array.isArray(movie.tmdbGenreIds) ? movie.tmdbGenreIds.map(Number) : undefined,
      tmdbGenres: Array.isArray(movie.tmdbGenres) ? movie.tmdbGenres.map(String) : undefined,
      cast: Array.isArray(movie.cast) ? movie.cast : [],
      crew: Array.isArray(movie.crew) ? movie.crew : [],
      trailerUrl: movie.trailerUrl ? String(movie.trailerUrl) : undefined,
      views: movie.views != undefined ? Number(movie.views) : 0,
      createdAt: movie.createdAt ? new Date(movie.createdAt as string) : new Date(),
      updatedAt: movie.updatedAt ? new Date(movie.updatedAt as string) : new Date(),
    } as unknown as IContent;
  } catch (error) {
    console.error("Failed to fetch movie:", error);
    return null;
  }
}

async function getSimilarMovies(language: string, excludeId: string) {
  try {
    await dbConnect();
    const movies = await Content.find({ 
      type: "movie", 
      language: language,
      _id: { $ne: excludeId }
    })
    .limit(10)
    .lean() as unknown as Record<string, unknown>[];
    
    return movies.map(m => ({
      _id: String(m._id || ""),
      title: String(m.title || ""),
      poster: String(m.poster || ""),
      banner: m.banner ? String(m.banner) : "",
      description: m.description ? String(m.description) : "",
      year: m.year ? String(m.year) : "",
      rating: m.rating != undefined ? Number(m.rating) : undefined,
      quality: m.quality ? String(m.quality) : "",
      language: m.language ? String(m.language) : "",
      type: String(m.type || "movie"),
      tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
      seasons: Array.isArray(m.seasons) ? m.seasons : [],
      episodes: Array.isArray(m.episodes) ? m.episodes : [],
      category: m.category ? String(m.category) : "",
      tmdbId: m.tmdbId != undefined ? Number(m.tmdbId) : undefined,
      tmdbGenreIds: Array.isArray(m.tmdbGenreIds) ? m.tmdbGenreIds.map(Number) : undefined,
      tmdbGenres: Array.isArray(m.tmdbGenres) ? m.tmdbGenres.map(String) : undefined,
      createdAt: m.createdAt ? new Date(m.createdAt as string) : new Date(),
      updatedAt: m.updatedAt ? new Date(m.updatedAt as string) : new Date(),
    })) as unknown as IContent[];
  } catch (error) {
    console.error("Failed to fetch similar movies:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const movieId = resolveMovieIdFromSlug(slug);
  const movie = await getMovie(movieId);
  
  if (!movie) {
    return {
      title: "Movie Not Found",
    };
  }
  
  const title = `${movie.title} ${movie.year ? `(${movie.year})` : ""} - Watch Online`;
  const description = movie.description || `Watch ${movie.title} online in HD quality. ${movie.language} movie.`;
  const imageUrl = movie.poster || movie.banner || SITE_CONFIG.ogImage;
  const url = `${SITE_CONFIG.url}/movie/${slug}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: movie.title,
        },
      ],
      type: "video.movie",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function MovieDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movieId = resolveMovieIdFromSlug(slug);
  const movie = await getMovie(movieId);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="pt-32 text-center px-4">
          <h1 className="text-2xl font-bold text-white mb-2">Movie not found</h1>
          <Link href="/" className="text-red-600 hover:text-red-500 mt-4 inline-block">
            Go back home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const similarMovies = await getSimilarMovies(movie.language || "Telugu", movie._id);
  const downloadUrl = normalizeExternalUrl(movie.downloadLink);
  const director = movie.crew?.find((c: { job?: string }) => c.job === "Director");

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#141414]">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner Image with Netflix-style gradient */}
        <div className="absolute inset-0 h-[85vh] lg:h-[90vh]">
          {(movie.banner || movie.poster) && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${movie.banner || movie.poster})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#141414]" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative pt-[45vh] lg:pt-[35vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
              {/* Left: Poster (hidden on large screens - show in right column) */}
              <div className="flex-shrink-0 lg:order-2 lg:ml-auto mb-[-80px] lg:mb-0 relative z-10">
                <div className="relative w-40 sm:w-48 md:w-56 lg:w-48 xl:w-56 aspect-[2/3] rounded-md overflow-hidden shadow-2xl ring-1 ring-white/20 hidden lg:block">
                  {movie.poster ? (
                    <Image
                      src={movie.poster}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex-1 lg:order-1 lg:pr-8 max-w-2xl">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                  {movie.title}
                </h1>

                {/* Meta Info Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-6">
                  {movie.year && (
                    <span className="text-white font-medium">{movie.year}</span>
                  )}
                  {movie.quality && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                      {movie.quality}
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/20 text-white rounded-sm">
                    {movie.language || "HD"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed line-clamp-3">
                  {movie.description}
                </p>

                {/* Genres */}
                {movie.tmdbGenres && movie.tmdbGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.tmdbGenres.slice(0, 4).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full border border-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons - Netflix Style */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Link
                    href={`/verify?id=${movie._id}&type=movie`}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3 bg-white text-black hover:bg-gray-200 font-medium rounded-sm transition-colors w-full sm:w-auto"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span className="text-base">Play</span>
                  </Link>
                  
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-base hidden sm:inline">Download</span>
                    </a>
                  )}
                </div>

                {/* Rating Badge */}
                {movie.rating && (
                  <div className="flex items-center gap-2 mb-8">
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-yellow-500 font-bold">{movie.rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">from users</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-white/10">
          {director && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Director</p>
              <p className="text-white text-sm font-medium">{director.name || "N/A"}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Cast</p>
            <p className="text-white text-sm font-medium line-clamp-2">
              {movie.cast?.slice(0, 3).map((c: { name?: string }) => c.name).join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Genres</p>
            <p className="text-white text-sm font-medium">
              {movie.tmdbGenres?.slice(0, 2).join(", ") || movie.tags?.slice(0, 2).join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Audio</p>
            <p className="text-white text-sm font-medium flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              {movie.audioLanguages?.slice(0, 2).join(", ") || movie.language || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
            <ContentGrid title="" items={similarMovies} isNetflixStyle />
        </div>
      )}

      <Footer />
    </div>
  );
}
