"use client";

import { useEffect, useState } from "react";
import { IContent } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroBanner from "@/components/HeroBanner";
import ContentGrid from "@/components/ContentGrid";
import MovieCard from "@/components/MovieCard";
import SeriesCard from "@/components/SeriesCard";
import { useAppSelector } from "@/redux/hooks";

interface HomeClientProps {
  initialContent: IContent[];
}

export default function HomeClient({ initialContent }: HomeClientProps) {
  const [content, setContent] = useState<IContent[]>(initialContent);
  const { search, typeFilter } = useAppSelector((state) => state.ui);

  useEffect(() => {
    if (initialContent.length === 0) {
      fetchContent();
    }
  }, []);

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

  const featuredContent =
    filteredContent.find((item: IContent) => item.category === "Trending") ||
    filteredContent[0];

  const trendingContent = filteredContent.filter((item: IContent) => item.category === "Trending");
  const latestContent = filteredContent.filter((item: IContent) => item.category === "Latest");
  const teluguMovies = filteredContent.filter(
    (item: IContent) => item.type === "movie" && item.language === "Telugu"
  );
  const hindiDubbed = filteredContent.filter(
    (item: IContent) => item.type === "movie" && (item.language === "Hindi" || item.category === "Dubbed")
  );
  const webSeries = filteredContent.filter((item: IContent) => item.type === "series");

  const showContent = search || typeFilter !== "all";

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

      {featuredContent && !showContent && (
        <HeroBanner content={featuredContent} />
      )}

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

        {/* Regular Content Rows */}
        {!showContent && (
          <>
            {trendingContent.length > 0 && (
              <ContentGrid title="Trending Now" items={trendingContent.slice(0, 12)} isNetflixStyle />
            )}

            {latestContent.length > 0 && (
              <ContentGrid title="Latest Releases" items={latestContent.slice(0, 12)} isNetflixStyle />
            )}

            {teluguMovies.length > 0 && (
              <ContentGrid title="Telugu Movies" items={teluguMovies.slice(0, 12)} isNetflixStyle />
            )}

            {hindiDubbed.length > 0 && (
              <ContentGrid title="Hindi Dubbed" items={hindiDubbed.slice(0, 12)} isNetflixStyle />
            )}

            {webSeries.length > 0 && (
              <ContentGrid title="Web Series" items={webSeries.slice(0, 12)} isNetflixStyle />
            )}
          </>
        )}

        {filteredContent.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center py-16">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-400 text-sm md:text-base">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
