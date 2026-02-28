"use client";

import { useEffect, useState } from "react";
import { IContent } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import ContentGrid from "@/components/ContentGrid";
import ContentDetailModal from "@/components/ContentDetailModal";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import TMDBContentGrid from "@/components/TMDBContentGrid";
import TelegramPopup from "@/components/TelegramPopup";
import GenreFilter from "@/components/GenreFilter";
import { useAppSelector } from "@/redux/hooks";

interface Genre {
  id: number;
  name: string;
}

interface TMDBContent {
  tmdbId: number;
  title: string;
  poster: string;
  banner: string;
  description: string;
  year: string;
  rating: number;
  genreIds?: number[];
  genres?: string[];
  type?: string;
}

interface HomeClientProps {
  initialContent: IContent[];
}

export default function HomeClient({ initialContent }: HomeClientProps) {
  const [content, setContent] = useState<IContent[]>(initialContent);
  const [selectedContent, setSelectedContent] = useState<IContent | null>(null);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [loadingGenres, setLoadingGenres] = useState(true);
  const [tmdbData, setTmdbData] = useState<{
    popular: { movies: TMDBContent[]; series: TMDBContent[] };
    trending: TMDBContent[];
    toprated: { movies: TMDBContent[]; series: TMDBContent[] };
    upcoming: { movies: TMDBContent[]; series: TMDBContent[] };
    telugu: TMDBContent[];
    hindi: TMDBContent[];
    tamil: TMDBContent[];
    malayalam: TMDBContent[];
    kannada: TMDBContent[];
    english: TMDBContent[];
    korean: TMDBContent[];
    japanese: TMDBContent[];
    byGenre: { [key: number]: TMDBContent[] };
  }>({
    popular: { movies: [], series: [] },
    trending: [],
    toprated: { movies: [], series: [] },
    upcoming: { movies: [], series: [] },
    telugu: [],
    hindi: [],
    tamil: [],
    malayalam: [],
    kannada: [],
    english: [],
    korean: [],
    japanese: [],
    byGenre: {},
  });
  const [loadingTmdb, setLoadingTmdb] = useState(true);
  const [tmdbError, setTmdbError] = useState("");
  const { search, typeFilter } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (initialContent.length === 0) {
      fetchContent();
    }
    fetchGenres();
    fetchAllTmdbContent();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch("/api/tmdb?action=genres");
      const data = await response.json();
      if (data.success) {
        setMovieGenres(data.data.movieGenres || []);
        setTvGenres(data.data.tvGenres || []);
      }
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    } finally {
      setLoadingGenres(false);
    }
  };

  const fetchAllTmdbContent = async () => {
    try {
      const [
        popularMoviesRes,
        popularSeriesRes,
        trendingRes,
        topratedMoviesRes,
        topratedSeriesRes,
        upcomingMoviesRes,
        upcomingSeriesRes,
      ] = await Promise.all([
        fetch("/api/tmdb?action=popular&type=movie"),
        fetch("/api/tmdb?action=popular&type=series"),
        fetch("/api/tmdb?action=trending&timeWindow=week"),
        fetch("/api/tmdb?action=toprated&type=movie"),
        fetch("/api/tmdb?action=toprated&type=series"),
        fetch("/api/tmdb?action=upcoming&type=movie"),
        fetch("/api/tmdb?action=upcoming&type=series"),
      ]);

      const [
        popularMovies,
        popularSeries,
        trending,
        topratedMovies,
        topratedSeries,
        upcomingMovies,
        upcomingSeries,
      ] = await Promise.all([
        popularMoviesRes.json(),
        popularSeriesRes.json(),
        trendingRes.json(),
        topratedMoviesRes.json(),
        topratedSeriesRes.json(),
        upcomingMoviesRes.json(),
        upcomingSeriesRes.json(),
      ]);

      const languages = [
        { code: "te", key: "telugu" },
        { code: "hi", key: "hindi" },
        { code: "ta", key: "tamil" },
        { code: "ml", key: "malayalam" },
        { code: "kn", key: "kannada" },
        { code: "en", key: "english" },
        { code: "ko", key: "korean" },
        { code: "ja", key: "japanese" },
      ];

      const languageData: Record<string, TMDBContent[]> = {};
      for (const lang of languages) {
        try {
          const res = await fetch(`/api/tmdb?action=bylanguage&language=${lang.code}&type=movie`);
          const data = await res.json();
          languageData[lang.key] = data.success ? data.data : [];
        } catch (e) {
          console.error(`Failed to fetch ${lang.key}:`, e);
          languageData[lang.key] = [];
        }
      }

      const topGenreIds = [28, 12, 35, 27, 10749, 878, 53, 16, 14, 80, 99, 36, 10402, 10770];
      const byGenre: { [key: number]: TMDBContent[] } = {};
      
      for (const genreId of topGenreIds) {
        try {
          const res = await fetch(`/api/tmdb?action=bygenre&genreId=${genreId}&type=movie`);
          const data = await res.json();
          byGenre[genreId] = data.success ? data.data : [];
        } catch (e) {
          console.error(`Failed to fetch genre ${genreId}:`, e);
          byGenre[genreId] = [];
        }
      }

      setTmdbData({
        popular: {
          movies: popularMovies.success ? popularMovies.data : [],
          series: popularSeries.success ? popularSeries.data : [],
        },
        trending: trending.success ? trending.data : [],
        toprated: {
          movies: topratedMovies.success ? topratedMovies.data : [],
          series: topratedSeries.success ? topratedSeries.data : [],
        },
        upcoming: {
          movies: upcomingMovies.success ? upcomingMovies.data : [],
          series: upcomingSeries.success ? upcomingSeries.data : [],
        },
        telugu: languageData.telugu || [],
        hindi: languageData.hindi || [],
        tamil: languageData.tamil || [],
        malayalam: languageData.malayalam || [],
        kannada: languageData.kannada || [],
        english: languageData.english || [],
        korean: languageData.korean || [],
        japanese: languageData.japanese || [],
        byGenre,
      });
    } catch (error) {
      console.error("Failed to fetch TMDB content:", error);
      setTmdbError("Failed to load TMDB content. Please check TMDB API key.");
    } finally {
      setLoadingTmdb(false);
    }
  };

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/content");
      const data = await response.json();
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    }
  };

  const filteredContent = content.filter((item: IContent) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "all" || item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const featuredContent = [...filteredContent]
    .sort((a: IContent, b: IContent) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    })[0];

  const tmdbTrendingMovies = [...filteredContent]
    .filter((item: IContent) => item.type === "movie" && item.tmdbId)
    .sort((a: IContent, b: IContent) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 12);

  const tmdbTrendingSeries = [...filteredContent]
    .filter((item: IContent) => item.type === "series" && item.tmdbId)
    .sort((a: IContent, b: IContent) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 12);

  const latestContent = [...filteredContent]
    .filter((item: IContent) => item.category === "Latest")
    .sort((a: IContent, b: IContent) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  const teluguMovies = [...filteredContent]
    .filter(
      (item: IContent) => item.type === "movie" && item.language === "Telugu"
    )
    .sort((a: IContent, b: IContent) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  const hindiDubbed = [...filteredContent]
    .filter(
      (item: IContent) => item.type === "movie" && (item.language === "Hindi" || item.category === "Dubbed")
    )
    .sort((a: IContent, b: IContent) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  const webSeries = filteredContent
    .filter((item: IContent) => item.type === "series")
    .sort((a: IContent, b: IContent) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

  const latestUploaded = [...filteredContent]
    .sort((a: IContent, b: IContent) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    })
    .slice(0, 12);

  const getContentByGenre = (genreId: number) => {
    return [...filteredContent]
      .filter((item: IContent) => item.tmdbGenreIds?.includes(genreId))
      .sort((a: IContent, b: IContent) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 12);
  };

  const getGenreName = (genreId: number): string => {
    const genre = movieGenres.find(g => g.id === genreId) || tvGenres.find(g => g.id === genreId);
    return genre?.name || "";
  };

  const getContentByLanguage = (language: string) => {
    return [...filteredContent]
      .filter((item: IContent) => item.language?.toLowerCase() === language.toLowerCase())
      .sort((a: IContent, b: IContent) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 12);
  };

  const languages = [
    { key: "telugu", name: "Telugu" },
    { key: "hindi", name: "Hindi" },
    { key: "tamil", name: "Tamil" },
    { key: "malayalam", name: "Malayalam" },
    { key: "kannada", name: "Kannada" },
    { key: "english", name: "English" },
    { key: "korean", name: "Korean" },
    { key: "japanese", name: "Japanese" },
  ];

  const topGenreIds = [28, 12, 35, 27, 10749, 878, 53, 16, 14, 80, 99, 36, 10402, 10770];

  const showContent = search || typeFilter !== "all";

  const handleContentClick = (item: IContent) => {
    setSelectedContent(item);
  };

  const handleCloseModal = () => {
    setSelectedContent(null);
  };

  if (content.length === 0) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />

      {/* Hero Banner - Show uploaded content */}
      {featuredContent && !showContent && (
        <HeroBanner content={featuredContent} onContentClick={handleContentClick} />
      )}

      {/* Genre Filter - Mobile */}
      <GenreFilter />

      <div className="pb-8 sm:pb-12 -mt-2 sm:-mt-4 relative z-10">
        {/* Search Results */}
        {showContent && (
          <section className="py-2">
            <div className="px-4 md:px-6 lg:px-8">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4">
                {search ? `Results for "${search}"` : typeFilter === "movie" ? "Movies" : typeFilter === "series" ? "TV Shows" : "All Content"}
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
                {filteredContent.slice(0, 21).map((item: IContent, index: number) => (
                  <div key={String(item._id)} className="w-full">
                    {item.type === "movie" ? (
                      <MovieCard movie={item} index={index} />
                    ) : (
                      <SeriesCard series={item} index={index} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Uploaded Content Sections - Only show uploaded movies/series */}
        {!showContent && (
          <>
            {latestUploaded.length > 0 && (
              <ContentGrid title="Latest Uploaded" items={latestUploaded} isNetflixStyle onContentClick={handleContentClick} />
            )}

            {/* TMDB-style Trending - Only uploaded movies/series with tmdbId */}
            {tmdbTrendingMovies.length > 0 && (
              <ContentGrid title="Trending Movies" items={tmdbTrendingMovies} isNetflixStyle onContentClick={handleContentClick} />
            )}

            {tmdbTrendingSeries.length > 0 && (
              <ContentGrid title="Trending TV Shows" items={tmdbTrendingSeries} isNetflixStyle onContentClick={handleContentClick} />
            )}

            {latestContent.length > 0 && (
              <ContentGrid title="Latest Releases" items={latestContent.slice(0, 12)} isNetflixStyle onContentClick={handleContentClick} />
            )}

            {/* Language-wise - Only show languages with uploaded content */}
            {languages.map((lang) => {
              const langContent = getContentByLanguage(lang.key);
              if (langContent.length > 0) {
                return (
                  <ContentGrid 
                    key={lang.key} 
                    title={`${lang.name} Movies`} 
                    items={langContent} 
                    isNetflixStyle 
                    onContentClick={handleContentClick} 
                  />
                );
              }
              return null;
            })}

            {webSeries.length > 0 && (
              <ContentGrid title="Web Series" items={webSeries.slice(0, 12)} isNetflixStyle onContentClick={handleContentClick} />
            )}

            {/* Genre-wise - Only show genres with uploaded content */}
            {!loadingGenres && topGenreIds.map((genreId) => {
              const genreContent = getContentByGenre(genreId);
              const genreName = getGenreName(genreId);
              if (genreContent.length > 0 && genreName) {
                return (
                  <ContentGrid 
                    key={genreId} 
                    title={`${genreName} Movies`} 
                    items={genreContent} 
                    isNetflixStyle 
                    onContentClick={handleContentClick} 
                  />
                );
              }
              return null;
            })}
          </>
        )}

        {filteredContent.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center py-16">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400 text-sm md:text-base">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <TelegramPopup channelLink="https://t.me/telugudbmovies1" />

      <ContentDetailModal content={selectedContent} isOpen={!!selectedContent} onClose={handleCloseModal} />

      <Footer />
    </main>
  );
}
