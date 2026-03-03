"use client";

// React hooks for state management and side effects
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
// UI icons from Lucide
import { Play, Download, ArrowLeft, Star, Calendar, Globe } from "lucide-react";
import { motion } from "framer-motion";
// Content model type definition
import { IContent } from "@/models/Content";
// Layout components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Reusable UI components
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
// Video player components
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
// Grid display for related content
import ContentGrid from "@/components/ContentGrid";

/**
 * WatchMovieContent - Main component for movie playback page
 * Displays video player, movie details, and related movies
 */
function WatchMovieContent() {
  // Get movie ID from URL parameters
  const params = useParams();
  // Store movie data from API
  const [movie, setMovie] = useState<IContent | null>(null);
  // Store related movies for suggestions
  const [relatedMovies, setRelatedMovies] = useState<IContent[]>([]);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Fetch movie data when component mounts or ID changes
  useEffect(() => {
    if (params.id) {
      fetchMovie();
    }
  }, [params.id]);

  /**
   * fetchMovie - Fetches movie details from API
   * Gets movie by ID and loads related movies
   */
  const fetchMovie = async () => {
    try {
      // Call API to get movie by ID
      const response = await fetch(`/api/content/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setMovie(data.data);
        // Fetch related movies after getting main movie
        fetchRelatedMovies(data.data._id);
      }
    } catch (error) {
      console.error("Failed to fetch movie:", error);
    } finally {
      // Stop loading spinner
      setLoading(false);
    }
  };

  /**
   * fetchRelatedMovies - Fetches other movies to display as suggestions
   * @param excludeId - Current movie ID to exclude from results
   */
  const fetchRelatedMovies = async (excludeId: string) => {
    try {
      const response = await fetch("/api/content?type=movie");
      const data = await response.json();
      if (data.success) {
        // Filter out current movie and limit to 6 items
        setRelatedMovies(data.data.filter((m: IContent) => String(m._id) !== excludeId).slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch related movies:", error);
    }
  };

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Placeholder for video player */}
            <div className="aspect-video bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Show error message if movie not found
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-white">Movie not found</h1>
          <Link href="/" className="text-red-600 mt-4 inline-block">
            Go back home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link - Navigation to movie details page */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href={`/movie/${String(movie._id)}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Movie Details
            </Link>
          </motion.div>

          {/* Video Player - Embeds streaming video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {movie.hlsUrl ? (
              <HlsPlayer src={movie.hlsUrl} title={movie.title} />
            ) : (
              <IframePlayer src={movie.embedIframeLink} title={movie.title} />
            )}
          </motion.div>

          {/* Movie Info - Displays movie metadata and details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          >
            {/* Poster - Movie thumbnail (hidden on mobile) */}
            <div className="hidden md:block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-border">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Details - Movie title, year, language, description */}
            <div className="md:col-span-2 space-y-4">
              {/* Badges - Movie type, quality, rating */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="gold">Movie</Badge>
                {movie.quality && <Badge variant="purple">{movie.quality}</Badge>}
                {movie.rating && (
                  <Badge variant="green" className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    {movie.rating}
                  </Badge>
                )}
              </div>

              {/* Movie Title */}
              <h1 className="text-3xl font-bold text-text-primary">{movie.title}</h1>

              {/* Metadata - Year and language */}
              <div className="flex flex-wrap items-center gap-4 text-text-muted">
                {movie.year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {movie.year}
                  </span>
                )}
                {movie.language && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {movie.language}
                  </span>
                )}
              </div>

              {/* Movie Description/Synopsis */}
              {movie.description && (
                <p className="text-text-muted">{movie.description}</p>
              )}

              {/* Download Button - If download link available */}
              {movie.downloadLink && (
                <a
                  href={movie.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="secondary" className="gap-2">
                    <Download className="w-5 h-5" />
                    Download Movie
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </div>

        {/* Related Movies - Suggestions section */}
        {relatedMovies.length > 0 && (
          <ContentGrid title="Related Movies" items={relatedMovies} isNetflixStyle />
        )}
      </div>

      <Footer />
    </div>
  );
}

/**
 * WatchMoviePage - Default export wrapper with Suspense
 * Provides loading fallback while component loads
 */
export default function WatchMoviePage() {
  return (
    <Suspense fallback={
      // Loading spinner while page loads
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WatchMovieContent />
    </Suspense>
  );
}
