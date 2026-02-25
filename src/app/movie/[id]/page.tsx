import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Play, Plus, ThumbsUp } from "lucide-react";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { SITE_CONFIG } from "@/utils/constants";

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
      type: String(movie.type || "movie"),
      tags: Array.isArray(movie.tags) ? movie.tags.map(String) : [],
      seasons: Array.isArray(movie.seasons) ? movie.seasons : [],
      episodes: Array.isArray(movie.episodes) ? movie.episodes : [],
      category: movie.category ? String(movie.category) : "",
      tmdbId: movie.tmdbId != undefined ? Number(movie.tmdbId) : undefined,
      tmdbGenreIds: Array.isArray(movie.tmdbGenreIds) ? movie.tmdbGenreIds.map(Number) : undefined,
      tmdbGenres: Array.isArray(movie.tmdbGenres) ? movie.tmdbGenres.map(String) : undefined,
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);
  
  if (!movie) {
    return {
      title: "Movie Not Found",
    };
  }
  
  const title = `${movie.title} ${movie.year ? `(${movie.year})` : ""} - Watch Online`;
  const description = movie.description || `Watch ${movie.title} online in HD quality. ${movie.language} movie.`;
  const imageUrl = movie.poster || movie.banner || SITE_CONFIG.ogImage;
  const url = `${SITE_CONFIG.url}/movie/${id}`;
  
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

export default async function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
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

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-16">
        <div className="relative w-full aspect-[16/9] h-auto min-h-[300px] max-h-[500px] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={movie.banner || movie.poster}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/40 to-[#141414]" />
          </div>

          <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-8 md:pb-12">
            <div className="max-w-xl lg:max-w-2xl space-y-3 md:space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                {movie.rating && (
                  <span className="text-green-400 font-semibold">{movie.rating} Match</span>
                )}
                {movie.year && (
                  <span className="text-white/80">{movie.year}</span>
                )}
                {movie.quality && (
                  <span className="text-white font-bold bg-[#e50914] px-1.5 py-0.5 text-xs rounded">
                    {movie.quality}
                  </span>
                )}
                <span className="text-white/80">{movie.language}</span>
                <span className="text-white/60">Movie</span>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/watch/${movie._id}`}>
                  <button className="bg-white text-black hover:bg-white/90 rounded px-5 md:px-7 py-2 md:py-2.5 flex items-center gap-2 font-bold text-sm">
                    <Play className="w-4 h-4 fill-black" />
                    Play
                  </button>
                </Link>
                <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              {movie.description && (
                <p className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-2">
                  {movie.description}
                </p>
              )}

              {movie.tags && movie.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {movie.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
          {similarMovies.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
              <ContentGrid title="" items={similarMovies} isNetflixStyle />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
