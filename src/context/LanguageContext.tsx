"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "te" | "hi" | "ta";

interface Translations {
  [key: string]: {
    en: string;
    te: string;
    hi: string;
    ta: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", te: "హోం", hi: "होम", ta: "முகப்பு" },
  "nav.movies": { en: "Movies", te: "చిత్రాలు", hi: "फिल्में", ta: "திரைப்படங்கள்" },
  "nav.tvshows": { en: "TV Shows", te: "TV షో", hi: "टीवी शो", ta: "TV நிகழ்ச்சிகள்" },
  "nav.request": { en: "Request", te: "REQUEST", hi: "REQUEST", ta: "REQUEST" },
  
  // Common
  "common.watch": { en: "Watch Now", te: " ఇప్పుడు చూడండి", hi: "अभी देखें", ta: "இப்போது பார்க்க" },
  "common.download": { en: "Download", te: "डाउनलोड", hi: "डाउनलोड", ta: "பதிவிறக்க" },
  "common.search": { en: "Search", te: "search", hi: "खोज", ta: "தேடு" },
  "common.loading": { en: "Loading...", te: "loading...", hi: "लोड हो रहा है...", ta: "ஏற்றுகிறது..." },
  
  // Movie Details
  "movie.trending": { en: "Trending", te: "trending", hi: "trending", ta: "trending" },
  "movie.latest": { en: "Latest", te: "latest", hi: "latest", ta: "latest" },
  "movie.moreLikeThis": { en: "More Like This", te: "more like this", hi: "more like this", ta: "more like this" },
  
  // Reviews
  "reviews.title": { en: "Reviews & Ratings", te: "reviews & ratings", hi: "reviews & ratings", ta: "reviews & ratings" },
  "reviews.write": { en: "Write a Review", te: "write a review", hi: "write a review", ta: "write a review" },
  "reviews.name": { en: "Your Name", te: "your name", hi: "your name", ta: "your name" },
  "reviews.yourReview": { en: "Your Review", te: "your review", hi: "your review", ta: "your review" },
  "reviews.submit": { en: "Submit Review", te: "submit review", hi: "submit review", ta: "submit review" },
  "reviews.noReviews": { en: "No reviews yet. Be the first to review!", te: "no reviews yet", hi: "no reviews yet", ta: "no reviews yet" },
  
  // Request
  "request.title": { en: "Request Content", te: "request content", hi: "request content", ta: "request content" },
  "request.subtitle": { en: "Couldn't find what you're looking for? Let us know!", te: "couldn't find", hi: "couldn't find", ta: "couldn't find" },
  "request.type": { en: "Content Type", te: "content type", hi: "content type", ta: "content type" },
  "request.movie": { en: "Movie", te: "movie", hi: "movie", ta: "movie" },
  "request.series": { en: "Series", te: "series", hi: "series", ta: "series" },
  "request.titleField": { en: "Title", te: "title", hi: "title", ta: "title" },
  "request.year": { en: "Year", te: "year", hi: "year", ta: "year" },
  "request.language": { en: "Language", te: "language", hi: "language", ta: "language" },
  "request.details": { en: "Additional Details", te: "additional details", hi: "additional details", ta: "additional details" },
  "request.submit": { en: "Submit Request", te: "submit request", hi: "submit request", ta: "submit request" },
  "request.success": { en: "Request Submitted!", te: "request submitted", hi: "request submitted", ta: "request submitted" },
  "request.thanks": { en: "Thank you for your request. We'll review it and add the content if available.", te: "thank you", hi: "thank you", ta: "thank you" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved && ["en", "te", "hi", "ta"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
