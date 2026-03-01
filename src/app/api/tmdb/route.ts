import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";

const GENRE_CACHE = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;
const EXISTING_IDS_CACHE: { ids: Set<number>; timestamp: number } = { ids: new Set(), timestamp: 0 };
const EXISTING_IDS_CACHE_DURATION = 60 * 1000;

async function getExistingTmdbIds(): Promise<Set<number>> {
  if (Date.now() - EXISTING_IDS_CACHE.timestamp < EXISTING_IDS_CACHE_DURATION && EXISTING_IDS_CACHE.ids.size > 0) {
    return EXISTING_IDS_CACHE.ids;
  }
  
  try {
    await connectDB();
    const contents = await Content.find({ tmdbId: { $exists: true, $ne: null } }).select("tmdbId").lean();
    const ids = new Set(contents.map((c) => c.tmdbId as number).filter(Boolean));
    EXISTING_IDS_CACHE.ids = ids;
    EXISTING_IDS_CACHE.timestamp = Date.now();
    return ids;
  } catch (error) {
    console.error("Error fetching existing tmdbIds:", error);
    return new Set();
  }
}

function filterExistingMovies<T extends { tmdbId: number }>(items: T[], existingIds: Set<number>): T[] {
  return items.filter((item) => existingIds.has(item.tmdbId));
}

async function fetchWithCache(url: string, cacheKey: string) {
  const cached = GENRE_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TMDB API error: ${response.status} - ${error}`);
  }
  const data = await response.json();
  
  GENRE_CACHE.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

function transformResults(items: unknown[], genreMap: Map<number, string>, existingIds?: Set<number>) {
  let filteredItems = items as {
    id: number;
    title?: string;
    name?: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    genre_ids?: number[];
    media_type?: string;
  }[];
  
  if (existingIds && existingIds.size > 0) {
    filteredItems = filteredItems.filter((item) => existingIds.has(item.id));
  }
  
  return filteredItems.slice(0, 20).map((item) => ({
    tmdbId: item.id,
    title: item.title || item.name,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
    banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
    description: item.overview,
    year: (item.release_date || item.first_air_date || "").split("-")[0],
    rating: Math.round(item.vote_average * 10) / 10,
    genreIds: item.genre_ids || [],
    genres: item.genre_ids?.map((id) => genreMap.get(id)).filter(Boolean) || [],
    type: item.media_type,
    originalLanguage: (item as { original_language?: string }).original_language || "",
  }));
}

async function getGenreMap(tmdbType: string, apiKey: string): Promise<Map<number, string>> {
  const genreData = await fetchWithCache(
    `https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`,
    `${tmdbType}_genres`
  ) as { genres?: { id: number; name: string }[] };
  return new Map(genreData.genres?.map((g) => [g.id, g.name]) || []);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "movie";
  const action = searchParams.get("action");
  const filterExisting = searchParams.get("filterExisting") !== "false";

  const apiKey = process.env.TMDB_API_KEY;
  
  console.log("TMDB API Key present:", !!apiKey, apiKey ? "yes" : "no");
  
  if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
    return NextResponse.json({ success: false, error: "TMDB API key not configured" }, { status: 500 });
  }

  if (action === "genres") {
    try {
      const movieGenres = await fetchWithCache(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}`,
        "movie_genres"
      );
      console.log("Movie genres response:", movieGenres);
      const tvGenres = await fetchWithCache(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}`,
        "tv_genres"
      );
      
      return NextResponse.json({
        success: true,
        data: {
          movieGenres: movieGenres.genres || [],
          tvGenres: tvGenres.genres || [],
        },
      });
    } catch (error) {
      console.error("TMDB genres error:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch genres" }, { status: 500 });
    }
  }

  if (action === "discover") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const genreId = searchParams.get("genreId");
      const tmdbType = type === "series" ? "tv" : "movie";
      
      let url = `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&sort_by=popularity.desc`;
      
      if (genreId) {
        url += `&with_genres=${genreId}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        const genreResponse = await fetch(
          `https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`
        );
        const genreData = await genreResponse.json();
        const genreMap = new Map(genreData.genres?.map((g: { id: number; name: string }) => [g.id, g.name]) || []);
        
        let filteredResults = data.results.filter((item: { id: number }) => existingIds.has(item.id));
        
        const results = filteredResults.slice(0, 20).map((item: { 
          id: number; 
          title?: string; 
          name?: string; 
          poster_path: string; 
          backdrop_path: string; 
          overview: string; 
          release_date?: string; 
          first_air_date?: string; 
          vote_average: number;
          genre_ids?: number[];
        }) => ({
          tmdbId: item.id,
          title: item.title || item.name,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
          banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
          description: item.overview,
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          rating: Math.round(item.vote_average * 10) / 10,
          genreIds: item.genre_ids || [],
          genres: item.genre_ids?.map((id: number) => genreMap.get(id)).filter(Boolean) || [],
        }));
        
        return NextResponse.json({ success: true, data: results });
      }
      
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("TMDB discover error:", error);
      return NextResponse.json({ success: false, error: "Failed to discover content" }, { status: 500 });
    }
  }

  if (action === "popular") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const tmdbType = type === "series" ? "tv" : "movie";
      console.log(`Fetching popular ${tmdbType}`);
      
      const response = await fetch(
        `https://api.themoviedb.org/3/${tmdbType}/popular?api_key=${apiKey}&language=en-US&page=1`
      );
      
      if (!response.ok) {
        console.error("TMDB API error:", response.status);
        return NextResponse.json({ success: true, data: [] });
      }
      
      const data = await response.json();
      
      const genreResponse = await fetch(
        `https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`
      );
      const genreData = await genreResponse.json();
      const genreMap = new Map(genreData.genres?.map((g: { id: number; name: string }) => [g.id, g.name]) || []);
      
      if (data.results) {
        const filteredResults = data.results.filter((item: { id: number }) => existingIds.has(item.id));
        
        const results = filteredResults.slice(0, 20).map((item: { 
          id: number; 
          title?: string; 
          name?: string; 
          poster_path: string; 
          backdrop_path: string; 
          overview: string; 
          release_date?: string; 
          first_air_date?: string; 
          vote_average: number;
          genre_ids?: number[];
        }) => ({
          tmdbId: item.id,
          title: item.title || item.name,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
          banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
          description: item.overview,
          year: (item.release_date || item.first_air_date || "").split("-")[0],
          rating: Math.round(item.vote_average * 10) / 10,
          genreIds: item.genre_ids || [],
          genres: item.genre_ids?.map((id: number) => genreMap.get(id)).filter(Boolean) || [],
        }));
        
        return NextResponse.json({ success: true, data: results });
      }
      
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("TMDB popular error:", error);
      return NextResponse.json({ success: true, data: [] });
    }
  }

  if (action === "trending") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const timeWindow = searchParams.get("timeWindow") || "week";
      
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${apiKey}`
      );
      if (!movieResponse.ok) {
        console.error("TMDB trending movie error:", movieResponse.status);
        return NextResponse.json({ success: true, data: [] });
      }
      const movieData = await movieResponse.json();
      
      const tvResponse = await fetch(
        `https://api.themoviedb.org/3/trending/tv/${timeWindow}?api_key=${apiKey}`
      );
      if (!tvResponse.ok) {
        console.error("TMDB trending TV error:", tvResponse.status);
        return NextResponse.json({ success: true, data: [] });
      }
      const tvData = await tvResponse.json();
      
      const allResults = [...(movieData.results || []), ...(tvData.results || [])]
        .filter((item: { id: number }) => existingIds.has(item.id))
        .sort((a: { vote_average: number }, b: { vote_average: number }) => b.vote_average - a.vote_average)
        .slice(0, 20);
      
      const results = allResults.map((item: { 
        id: number; 
        title?: string; 
        name?: string; 
        media_type: string;
        poster_path: string; 
        backdrop_path: string; 
        overview: string; 
        release_date?: string; 
        first_air_date?: string; 
        vote_average: number;
        genre_ids?: number[];
      }) => ({
        tmdbId: item.id,
        title: item.title || item.name,
        type: item.media_type,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
        description: item.overview,
        year: (item.release_date || item.first_air_date || "").split("-")[0],
        rating: Math.round(item.vote_average * 10) / 10,
        genreIds: item.genre_ids || [],
      }));
      
      return NextResponse.json({ success: true, data: results });
    } catch (error) {
      console.error("TMDB trending error:", error);
      return NextResponse.json({ success: true, data: [] });
    }
  }

  if (action === "toprated") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const tmdbType = type === "series" ? "tv" : "movie";
      const genreMap = await getGenreMap(tmdbType, apiKey);
      
      const response = await fetch(
        `https://api.themoviedb.org/3/${tmdbType}/top_rated?api_key=${apiKey}&language=en-US&page=1`
      );
      const data = await response.json();
      
      if (data.results) {
        const results = transformResults(data.results, genreMap, existingIds);
        return NextResponse.json({ success: true, data: results });
      }
      
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("TMDB toprated error:", error);
      return NextResponse.json({ success: true, data: [] });
    }
  }

  if (action === "upcoming") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const tmdbType = type === "series" ? "tv" : "movie";
      const genreMap = await getGenreMap(tmdbType, apiKey);
      
      let url = `https://api.themoviedb.org/3/${tmdbType}/`;
      url += tmdbType === "movie" ? "upcoming" : "on_the_air";
      url += `?api_key=${apiKey}&language=en-US&page=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        const results = transformResults(data.results, genreMap, existingIds);
        return NextResponse.json({ success: true, data: results });
      }
      
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("TMDB upcoming error:", error);
      return NextResponse.json({ success: true, data: [] });
    }
  }

  if (action === "bygenre") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const genreId = searchParams.get("genreId");
      if (!genreId) {
        return NextResponse.json({ success: false, error: "genreId required" }, { status: 400 });
      }
      
      const tmdbType = type === "series" ? "tv" : "movie";
      const genreMap = await getGenreMap(tmdbType, apiKey);
      
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&with_genres=${genreId}&sort_by=popularity.desc&language=en-US&page=1`
      );
      
      if (!response.ok) {
        console.error("TMDB bygenre API error:", response.status);
        return NextResponse.json({ success: false, error: `TMDB API error: ${response.status}` }, { status: 500 });
      }
      
      const data = await response.json();
      
      if (data.results) {
        const results = transformResults(data.results, genreMap, existingIds);
        return NextResponse.json({ success: true, data: results });
      }
      
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("TMDB bygenre error:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch by genre" }, { status: 500 });
    }
  }

  if (action === "bylanguage") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const language = searchParams.get("language") || "te";
      const tmdbType = type === "series" ? "tv" : "movie";
      const genreMap = await getGenreMap(tmdbType, apiKey);
      
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&with_original_language=${language}&sort_by=popularity.desc&language=en-US&page=1`
      );
      
      if (!response.ok) {
        console.error("TMDB bylanguage API error:", response.status, await response.text());
        return NextResponse.json({ success: false, error: `TMDB API error: ${response.status}` }, { status: 500 });
      }
      
      const data = await response.json();
      
      if (data.results) {
        const results = transformResults(data.results, genreMap, existingIds);
        return NextResponse.json({ success: true, data: results });
      }
      
      return NextResponse.json({ success: true, data: [] });
    } catch (error) {
      console.error("TMDB bylanguage error:", error);
      return NextResponse.json({ success: false, error: "Failed to fetch by language" }, { status: 500 });
    }
  }

  if (action === "indian") {
    try {
      const existingIds = filterExisting ? await getExistingTmdbIds() : new Set<number>();
      const tmdbType = type === "series" ? "tv" : "movie";
      const genreMap = await getGenreMap(tmdbType, apiKey);
      
      const languages = ["te", "hi", "ta", "ml", "kn", "mr", "bn", "gu"];
      const allResults: unknown[] = [];
      
      for (const lang of languages) {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/${tmdbType}?api_key=${apiKey}&with_original_language=${lang}&sort_by=popularity.desc&language=en-US&page=1`
        );
        const data = await response.json();
        if (data.results) {
          allResults.push(...data.results.slice(0, 5));
        }
      }
      
      const uniqueResults = allResults.reduce((acc: unknown[], item: unknown) => {
        const existing = acc.find((i: unknown) => (i as { id: number }).id === (item as { id: number }).id);
        if (!existing) {
          acc.push(item);
        }
        return acc;
      }, []);
      
      const sortedResults = (uniqueResults as { vote_average: number }[])
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
      
      const results = transformResults(sortedResults, genreMap, existingIds);
      return NextResponse.json({ success: true, data: results });
    } catch (error) {
      console.error("TMDB indian error:", error);
      return NextResponse.json({ success: true, data: [] });
    }
  }

  if (!query) {
    return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });
  }

  try {
    const tmdbType = type === "series" ? "tv" : "movie";
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );
    
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const genreResponse = await fetch(
        `https://api.themoviedb.org/3/genre/${tmdbType}/list?api_key=${apiKey}`
      );
      const genreData = await genreResponse.json();
      const genreMap = new Map(genreData.genres?.map((g: { id: number; name: string }) => [g.id, g.name]) || []);
      
      const results = data.results.slice(0, 10).map((item: { 
        id: number; 
        title?: string; 
        name?: string; 
        poster_path: string; 
        backdrop_path: string; 
        overview: string; 
        release_date?: string; 
        first_air_date?: string; 
        vote_average: number;
        genre_ids?: number[];
      }) => ({
        tmdbId: item.id,
        title: item.title || item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
        description: item.overview,
        year: (item.release_date || item.first_air_date || "").split("-")[0],
        rating: Math.round(item.vote_average * 10) / 10,
        genreIds: item.genre_ids || [],
        genres: item.genre_ids?.map((id: number) => genreMap.get(id)).filter(Boolean) || [],
      }));

      return NextResponse.json({ success: true, data: results });
    }

    if (action === "details") {
      const id = searchParams.get("id");
      if (!id) {
        return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
      }
      const tmdbType = type === "series" ? "tv" : "movie";
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${tmdbType}/${id}?api_key=${apiKey}&language=en-US`
        );
        const data = await response.json();
        return NextResponse.json({ success: true, data });
      } catch (error) {
        console.error("TMDB details error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch details" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
