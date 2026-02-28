"use client";

// React hooks for state management and side effects
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
// Next.js navigation hooks
import { useParams, useSearchParams } from "next/navigation";
// UI icons from Lucide
import { ArrowLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Content model types (IContent, IEpisode, ISeason)
import { IContent, IEpisode, ISeason } from "@/models/Content";
// Layout components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Video player component
import IframePlayer from "@/components/IframePlayer";
// Badge UI component
import Badge from "@/components/ui/Badge";
// Utility for conditional class names
import { cn } from "@/utils/cn";

/**
 * SeriesWatchContent - Main component for TV series playback page
 * Handles video player, season/episode selection, and auto-play
 */
function SeriesWatchContent() {
  // Get series ID from URL parameters
  const params = useParams();
  // Get season/episode from URL query parameters
  const searchParams = useSearchParams();
  // Store series data from API
  const [series, setSeries] = useState<IContent | null>(null);
  // Currently selected season number
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  // Currently playing episode data
  const [currentEpisode, setCurrentEpisode] = useState<IEpisode | null>(null);
  // Loading state while fetching data
  const [loading, setLoading] = useState(true);
  // Toggle episode list dropdown visibility
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  // Auto-play next episode feature toggle
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  // Extract season and episode from URL query params
  const seasonParam = searchParams.get("season");
  const episodeParam = searchParams.get("episode");

  // Fetch series data when component mounts or ID changes
  useEffect(() => {
    if (params.id) {
      fetchSeries();
    }
  }, [params.id]);

  /**
   * Handle URL parameter changes for season/episode selection
   * Updates current episode when URL changes
   */
  useEffect(() => {
    if (series && seasonParam && episodeParam) {
      // Parse URL parameters to numbers
      const seasonNum = parseInt(seasonParam);
      const episodeNum = parseInt(episodeParam);
      // Find matching season and episode
      const season = series.seasons?.find((s) => s.seasonNumber === seasonNum);
      const episode = season?.episodes.find((e) => e.episodeNumber === episodeNum);
      if (episode) {
        setCurrentSeason(seasonNum);
        setCurrentEpisode(episode);
      }
    } else if (series && !currentEpisode) {
      // Default to first episode of first season if no params
      const firstSeason = series.seasons?.[0];
      const firstEpisode = firstSeason?.episodes[0];
      if (firstEpisode) {
        setCurrentSeason(firstSeason.seasonNumber);
        setCurrentEpisode(firstEpisode);
      }
    }
  }, [series, seasonParam, episodeParam]);

  /**
   * fetchSeries - Fetches series details from API
   * Loads all seasons and episodes for the series
   */
  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setSeries(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch series:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * handleEpisodeSelect - Updates URL and state when user selects episode
   * @param episode - The episode object to play
   * @param seasonNumber - The season number containing the episode
   */
  const handleEpisodeSelect = (episode: IEpisode, seasonNumber: number) => {
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episode);
    setShowEpisodeList(false);
    // Update URL without full page navigation (SPA behavior)
    const url = new URL(window.location.href);
    url.searchParams.set("season", seasonNumber.toString());
    url.searchParams.set("episode", episode.episodeNumber.toString());
    window.history.replaceState({}, "", url);
  };

  /**
   * playNextEpisode - Automatically plays the next episode
   * Handles transitions within same season and to next season
   */
  const playNextEpisode = () => {
    if (!series || !currentEpisode) return;
    
    // Find current season and episode index
    const currentSeasonData = series.seasons?.find((s) => s.seasonNumber === currentSeason);
    const currentEpisodeIndex = currentSeasonData?.episodes.findIndex((e) => e.episodeNumber === currentEpisode?.episodeNumber);
    
    // Check if there are more episodes in current season
    if (currentEpisodeIndex !== undefined && currentEpisodeIndex < (currentSeasonData?.episodes.length || 0) - 1) {
      const nextEpisode = currentSeasonData?.episodes[currentEpisodeIndex + 1];
      if (nextEpisode) {
        handleEpisodeSelect(nextEpisode, currentSeason);
      }
    } else {
      // Move to first episode of next season
      const nextSeason = series.seasons?.find((s) => s.seasonNumber === currentSeason + 1);
      if (nextSeason && nextSeason.episodes.length > 0) {
        handleEpisodeSelect(nextSeason.episodes[0], nextSeason.seasonNumber);
      }
    }
  };

  // Get current season data for episode list display
  const currentSeasonData = series?.seasons?.find((s) => s.seasonNumber === currentSeason);

  // Show loading skeleton while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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

  // Show error message if series not found
  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Series not found</h1>
          <Link href="/" className="text-primary-gold mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link - Navigation to series details page */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href={`/series/${String(series._id)}`}
              className="inline-flex items-center gap-2 text-text-muted hover:text-primary-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Series Details
            </Link>
          </motion.div>

          {/* Video Player - Embeds streaming video for current episode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <IframePlayer
              src={currentEpisode?.embedIframeLink}
              title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
            />
          </motion.div>

          {/* Episode Info - Shows current episode details and auto-play toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {/* Badges - Season, Episode number, Quality, Auto-play toggle */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="purple">S{currentSeason}</Badge>
              <Badge variant="gold">E{currentEpisode?.episodeNumber}</Badge>
              {currentEpisode?.quality && (
                <Badge variant="outline">{currentEpisode.quality}</Badge>
              )}
              {/* Auto-play toggle button */}
              <button
                onClick={() => setAutoPlayNext(!autoPlayNext)}
                className={`ml-auto px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  autoPlayNext 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {autoPlayNext ? "Auto-play On" : "Auto-play Off"}
              </button>
            </div>
            {/* Episode Title */}
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
            </h1>
            {/* Series Title */}
            <p className="text-text-muted text-lg">{series.title}</p>
          </motion.div>

          {/* Episode Selector - Season tabs and episode list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Season Selector - Horizontal scrollable tabs */}
            <div className="flex border-b border-border overflow-x-auto">
              {series.seasons?.map((season) => (
                <button
                  key={season.seasonNumber}
                  onClick={() => {
                    setCurrentSeason(season.seasonNumber);
                    // Select first episode of this season
                    if (season.episodes.length > 0) {
                      handleEpisodeSelect(season.episodes[0], season.seasonNumber);
                    }
                  }}
                  className={cn(
                    "px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors",
                    currentSeason === season.seasonNumber
                      ? "text-primary-gold border-b-2 border-primary-gold"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  Season {season.seasonNumber}
                </button>
              ))}
            </div>

            {/* Episode List - Scrollable list of episodes in current season */}
            <div className="max-h-96 overflow-y-auto">
              {currentSeasonData?.episodes.map((episode) => {
                // Check if this is the currently playing episode
                const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;

                return (
                  <button
                    key={episode.episodeNumber}
                    onClick={() => handleEpisodeSelect(episode, currentSeason)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-border/30",
                      isActive && "bg-primary-gold/10 border-l-4 border-l-primary-gold"
                    )}
                  >
                    {/* Episode Number Badge */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                      <span className="text-sm font-semibold text-text-muted">
                        {episode.episodeNumber}
                      </span>
                    </div>
                    {/* Episode Title and Quality */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary truncate">
                        {episode.episodeTitle}
                      </h4>
                      {episode.quality && (
                        <span className="text-xs text-text-muted">{episode.quality}</span>
                      )}
                    </div>
                    {/* Download Button - If download link available */}
                    {episode.downloadLink && (
                      <a
                        href={episode.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg bg-border text-xs text-text-muted hover:text-secondary-purple hover:bg-secondary-purple/10 transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

/**
 * SeriesWatchPage - Default export wrapper with Suspense
 * Provides loading fallback while component loads
 */
export default function SeriesWatchPage() {
  return (
    <Suspense fallback={
      // Loading spinner while page loads
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <SeriesWatchContent />
    </Suspense>
  );
}
