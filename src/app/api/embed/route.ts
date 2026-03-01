import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { tmdbId, imdbId, type, season, episode } = await request.json();

    if (!tmdbId && !imdbId) {
      return NextResponse.json(
        { success: false, error: "tmdbId or imdbId is required" },
        { status: 400 }
      );
    }

    let embedUrl = "";

    if (type === "movie") {
      // Movie embed URL
      if (tmdbId) {
        embedUrl = `https://vidsrc-embed.ru/embed/movie?tmdb=${tmdbId}`;
      } else if (imdbId) {
        embedUrl = `https://vidsrc-embed.ru/embed/movie?imdb=${imdbId}`;
      }
    } else if (type === "series") {
      // TV Show embed URL
      if (season && episode) {
        // Episode embed URL
        if (tmdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
        } else if (imdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?imdb=${imdbId}&season=${season}&episode=${episode}`;
        }
      } else {
        // Series main embed URL
        if (tmdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${tmdbId}`;
        } else if (imdbId) {
          embedUrl = `https://vidsrc-embed.ru/embed/tv?imdb=${imdbId}`;
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
