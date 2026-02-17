"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Download, ArrowLeft, Star, Calendar, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { IContent } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import IframePlayer from "@/components/IframePlayer";
import ContentGrid from "@/components/ContentGrid";
import AdBanner from "@/components/AdBanner";

export default function WatchMoviePage() {
  const params = useParams();
  const [movie, setMovie] = useState<IContent | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchMovie();
    }
  }, [params.id]);

  const fetchMovie = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setMovie(data.data);
        fetchRelatedMovies(data.data._id);
      }
    } catch (error) {
      console.error("Failed to fetch movie:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMovies = async (excludeId: string) => {
    try {
      const response = await fetch("/api/content?type=movie");
      const data = await response.json();
      if (data.success) {
        setRelatedMovies(data.data.filter((m: IContent) => String(m._id) !== excludeId).slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch related movies:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

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
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
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

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <IframePlayer src={movie.embedIframeLink} title={movie.title} />
          </motion.div>

          {/* Movie Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
          >
            {/* Poster */}
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

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
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

              <h1 className="text-3xl font-bold text-text-primary">{movie.title}</h1>

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

              {movie.description && (
                <p className="text-text-muted">{movie.description}</p>
              )}

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

          {/* Ad Banner */}
          <div className="mb-8">
            <AdBanner slot="movie-watch" className="w-full h-24" />
          </div>
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <ContentGrid title="Related Movies" items={relatedMovies} isNetflixStyle />
        )}
      </div>

      <Footer />
    </main>
  );
}
