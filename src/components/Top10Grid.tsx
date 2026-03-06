"use client";

import { useRef, useState, useEffect } from "react";
import { IContent } from "@/models/Content";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Top10GridProps {
  title: string;
  items: IContent[];
  onContentClick?: (content: IContent) => void;
}

export default function Top10Grid({ title, items, onContentClick }: Top10GridProps) {
  const topItems = items.slice(0, 10);
  if (topItems.length === 0) return null;

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
      const scrollAmount = window.innerWidth >= 1280 ? 400 : window.innerWidth >= 768 ? 320 : 240;
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (item: IContent) => {
    if (onContentClick) {
      onContentClick(item);
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 px-4 sm:px-8 md:px-12">{title}</h2>
      
      <div className="relative group">
        {showLeftArrow && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/70 flex items-center justify-center w-8 sm:w-12 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        )}
        
        <div
          ref={scrollRef}
          className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide px-4 sm:px-8 md:px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {topItems.map((item, index) => (
            <div key={item._id} className="flex-shrink-0 relative group/item">
              <Link
                href={item.type === "series" ? `/series/${item._id}` : `/movie/${item._id}`}
                onClick={() => handleClick(item)}
                className="block"
              >
                <div className="relative">
                  {/* Rank Number */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-20">
                    <span className="text-5xl sm:text-6xl md:text-7xl font-black text-black/80 drop-shadow-lg leading-none">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Card */}
                  <div className="w-32 sm:w-40 md:w-48 lg:w-56 aspect-[2/3] relative rounded-md overflow-hidden transition-transform duration-300 group-hover/item:scale-105 group-hover/item:z-10">
                    {item.poster ? (
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, 224px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Poster</span>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/40 transition-colors" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 hover:bg-black/70 flex items-center justify-center w-8 sm:w-12 transition-colors"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
