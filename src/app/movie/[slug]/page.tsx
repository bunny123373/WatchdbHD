import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Play, Share2, Plus, Info, Star, Calendar, Download, Clapperboard, Users, Youtube } from "lucide-react";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import ShareButton from "@/components/ShareButton";
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

  return (
    <div className="min-h-screen bg-[#141414]">
      <div className="relative">
        <div className="absolute inset-0 h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
          {movie.banner ? (
            <Image
              src={movie.banner}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          ) : movie.poster ? (
            <Image
              src={movie.poster}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-transparent to-transparent" />
        </div>

        <div className="relative pt-[30vh] sm:pt-[40vh] md:pt-[50vh] lg:pt-[60vh] px-4 sm:px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
              <div className="flex-shrink-0 hidden lg:block">
                <div className="relative w-64 xl:w-72 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10">
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
                      <span className="text-gray-500">No Poster</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm text-gray-300 mb-5 sm:mb-6">
                  {movie.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-white">{movie.rating}</span>
                    </div>
                  )}
                  {movie.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {movie.year}
                    </span>
                  )}
                  {movie.quality && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-sm">
                      {movie.quality}
                    </span>
                  )}
                  {movie.language && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white rounded-sm">
                      {movie.language}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-4 lg:line-clamp-6 max-w-3xl">
                  {movie.description}
                </p>

                {movie.tmdbGenres && movie.tmdbGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                    {movie.tmdbGenres.slice(0, 4).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 text-xs sm:text-sm bg-white/10 text-white rounded-full border border-white/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
                  <Link
                    href={`/verify?id=${movie._id}&type=movie`}
                    className="flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#e50914] hover:bg-[#f40612] text-white font-bold rounded-md transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Play</span>
                  </Link>
                  
                  <button className="flex items-center gap-2.5 px-5 sm:px-6 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-all text-sm">
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">My List</span>
                  </button>
                  
                  <ShareButton title={movie.title} />
                  
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-5 sm:px-6 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-all text-sm"
                    >
                      <Download className="w-5 h-5" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-4 border-t border-b border-white/10">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Director</p>
                    <p className="text-white text-sm font-medium">
                      {movie.crew?.find((c: { job?: string }) => c.job === "Director")?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Cast</p>
                    <p className="text-white text-sm font-medium line-clamp-1">
                      {movie.cast?.slice(0, 3).map((c: { name?: string }) => c.name).join(", ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Genre</p>
                    <p className="text-white text-sm font-medium">
                      {movie.tmdbGenres?.slice(0, 2).join(", ") || movie.tags?.slice(0, 2).join(", ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Audio</p>
                    <p className="text-white text-sm font-medium">
                      {movie.audioLanguages?.join(", ") || movie.language || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarMovies.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
            <ContentGrid title="" items={similarMovies} isNetflixStyle />
        </div>
      )}

      {movie.trailerUrl && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Youtube className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            Trailer
          </h2>
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={movie.trailerUrl.replace("watch?v=", "embed/")}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {movie.cast && movie.cast.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            Cast
          </h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4">
            {movie.cast.map((cast: { name: string; character?: string; image?: string }, idx: number) => (
              <div key={idx} className="flex-shrink-0 w-20 sm:w-24 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full overflow-hidden bg-gray-800 mb-2">
                  {cast.image ? (
                    <img src={cast.image} alt={cast.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                    </div>
                  )}
                </div>
                <p className="text-white text-xs sm:text-sm font-medium truncate px-1">{cast.name}</p>
                {cast.character && <p className="text-gray-400 text-xs truncate px-1">{cast.character}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
