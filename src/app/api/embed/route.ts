import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tmdbId, imdbId, type, season, episode, language } = await request.json();

    if (!tmdbId && !imdbId) {
      return NextResponse.json(
        { success: false, error: "tmdbId or imdbId is required" },
        { status: 400 }
      );
    }

    let embedUrl = "";
    const langParam = language && language !== "all" ? `&ds_lang=${language}` : "";

    if (type === "movie") {
      // Movie embed URL
      if (tmdbId) {
        embedUrl = `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}${langParam}`;
      } else if (imdbId) {
        embedUrl = `https://vidsrc-embed.ru/embed/movie?imdb=${imdbId}${langParam}`;
      }
    } else if (type === "series") {
      // TV Show embed URL
      if (season && episode) {
        // Episode embed URL
        if (tmdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}${langParam}`;
        } else if (imdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}${langParam}`;
        }
      } else {
        // Series main embed URL
        if (tmdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}${langParam}`;
        } else if (imdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?imdb=${imdbId}${langParam}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      embedUrl
    });
  } catch (error) {
    console.error("Error generating embed URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate embed URL" },
      { status: 500 }
    );
  }
}
