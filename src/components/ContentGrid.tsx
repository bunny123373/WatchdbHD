"use client";

import { useRef, useState, useEffect } from "react";
import { IContent } from "@/models/Content";
import MovieCard from "./MovieCard";
import SeriesCard from "./SeriesCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentGridProps {
  title: string;
  items: IContent[];
  horizontal?: boolean;
  isNetflixStyle?: boolean;
}

export default function ContentGrid({ title, items, horizontal = false, isNetflixStyle = false }: ContentGridProps) {
  if (items.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth >= 1280 ? 300 : window.innerWidth >= 768 ? 250 : 200;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (isNetflixStyle) {
    return (
      <section className="py-1 mb-6">
        <div className="px-4 md:px-6 lg:px-8">
          {title && (
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2">
              {title}
            </h2>
          )}

          <div className="relative group">
            {/* Left Arrow */}
            {showLeftArrow && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-0 bottom-0 z-10 w-6 md:w-10 bg-black/70 hover:bg-black/90 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}

            {/* Content Row */}
            <div
              ref={scrollRef}
              className="flex gap-1.5 md:gap-2 lg:gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((item, index) => (
                <div
                  key={String(item._id)}
                  className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 xl:w-44"
                >
                  {item.type === "movie" ? (
                    <MovieCard movie={item} index={index} />
                  ) : (
                    <SeriesCard series={item} index={index} />
                  )}
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            {showRightArrow && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-0 bottom-0 z-10 w-6 md:w-10 bg-black/70 hover:bg-black/90 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (horizontal) {
    return (
      <section className="py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#333] to-transparent" />
          </div>

          <div className="relative -mx-4 px-4">
            <div
              ref={scrollRef}
              className="flex gap-1 md:gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
            >
              {items.map((item, index) => (
                <div key={String(item._id)} className="flex-shrink-0 w-28 sm:w-32 md:w-36 lg:w-40 snap-start">
                  {item.type === "movie" ? (
                    <MovieCard movie={item} index={index} />
                  ) : (
                    <SeriesCard series={item} index={index} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[#333] to-transparent" />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
          {items.map((item, index) => (
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
  );
}
