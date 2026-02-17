import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const type = searchParams.get("type") || "movie";

  if (!query) {
    return NextResponse.json({ success: false, error: "Query required" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey || apiKey === "YOUR_TMDB_API_KEY") {
    return NextResponse.json({ success: false, error: "TMDB API key not configured" }, { status: 500 });
  }

  try {
    const tmdbType = type === "series" ? "tv" : "movie";
    const response = await fetch(
      `https://api.themoviedb.org/3/search/${tmdbType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`
    );
    
    const data = await response.json();

    if (data.results && data.results.length > 0) {
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
      }) => ({
        tmdbId: item.id,
        title: item.title || item.name,
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        banner: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "",
        description: item.overview,
        year: (item.release_date || item.first_air_date || "").split("-")[0],
        rating: Math.round(item.vote_average * 10) / 10,
      }));

      return NextResponse.json({ success: true, data: results });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ success: false, error: "Failed to search TMDB" }, { status: 500 });
  }
}
