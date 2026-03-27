import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Play, Star, Globe, ChevronLeft } from "lucide-react";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import DownloadButton from "@/components/DownloadButton";
import BackButton from "@/components/BackButton";
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
      type: String(movie.type || "movie"),
      tags: Array.isArray(movie.tags) ? movie.tags.map(String) : [],
      seasons: Array.isArray(movie.seasons) ? movie.seasons : [],
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
    return null;
  }
}

async function getSimilarMovies(language: string, excludeId: string) {
  try {
    await dbConnect();
    const movies = await Content.find({ type: "movie", language, _id: { $ne: excludeId } })
      .limit(10).lean() as unknown as Record<string, unknown>[];
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
      tmdbId: m.tmdbId != undefined ? Number(m.tmdbId) : undefined,
      tmdbGenres: Array.isArray(m.tmdbGenres) ? m.tmdbGenres.map(String) : undefined,
    })) as unknown as IContent[];
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const movie = await getMovie(resolveMovieIdFromSlug(slug));
  if (!movie) return { title: "Movie Not Found" };
  const imageUrl = movie.poster || movie.banner || SITE_CONFIG.ogImage;
  return {
    title: `${movie.title} ${movie.year ? `(${movie.year})` : ""} - Watch Online`,
    description: movie.description || `Watch ${movie.title} online in HD quality.`,
    openGraph: { title: movie.title, description: movie.description, images: [{ url: imageUrl }] },
    twitter: { card: "summary_large_image", images: [imageUrl] },
  };
}

export default async function MovieDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await getMovie(resolveMovieIdFromSlug(slug));

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <Link href="/" className="text-red-500 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  const similarMovies = await getSimilarMovies(movie.language || "Telugu", movie._id);
  const downloadUrl = normalizeExternalUrl(movie.downloadLink);
  const director = movie.crew?.find((c: { job?: string }) => c.job === "Director");

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <div className="relative">
        {/* Banner Background */}
        <div className="absolute inset-0 h-[60vh] md:h-[70vh]">
          {movie.banner || movie.poster ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${movie.banner || movie.poster})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
          )}
        </div>

        {/* Back Button */}
        <BackButton />

        {/* Content */}
        <div className="relative z-10 pt-[35vh] md:pt-[45vh] px-4">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{movie.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-6">
            {movie.year && <span>{movie.year}</span>}
            {movie.quality && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">{movie.quality}</span>
            )}
            {movie.language && <span>{movie.language}</span>}
            {movie.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-yellow-500">{movie.rating}</span>
              </span>
            )}
          </div>

          {/* Play Button - Full width mobile */}
          <Link
            href={`/verify?id=${movie._id}&type=movie`}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors mb-4"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Play</span>
          </Link>

          {/* Download Button */}
          {downloadUrl && (
            <DownloadButton
              url={downloadUrl}
              title={movie.title}
              className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto px-6 py-2.5 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors mb-6"
            />
          )}

          {/* Description */}
          <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-8">
            {movie.description}
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="px-4 py-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          {director && (
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Director</p>
              <p className="text-white text-sm">{director.name || "N/A"}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Cast</p>
            <p className="text-white text-sm line-clamp-2">
              {movie.cast?.slice(0, 3).map((c: { name?: string }) => c.name).join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Genres</p>
            <p className="text-white text-sm">{movie.tmdbGenres?.slice(0, 2).join(", ") || movie.tags?.slice(0, 2).join(", ") || "N/A"}</p>
          </div>
            <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Audio</p>
            <p className="text-white text-sm flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {movie.audioLanguages?.join(", ") || movie.language || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Genres */}
      {movie.tmdbGenres && movie.tmdbGenres.length > 0 && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {movie.tmdbGenres.map((genre: string) => (
              <span key={genre} className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full">
                {genre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Similar Movies */}
      {similarMovies.length > 0 && (
        <div className="px-4 py-6 border-t border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">More Like This</h2>
          <ContentGrid title="" items={similarMovies} isNetflixStyle />
        </div>
      )}

      <Footer />
    </div>
  );
}
