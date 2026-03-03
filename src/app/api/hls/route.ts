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

    const id = tmdbId || imdbId;
    const idParam = tmdbId ? `tmdb=${tmdbId}` : `imdb=${imdbId}`;

    let hlsUrl = "";

    const sources = [
      `https://vidsrc-embed.ru/embed/${type}?${idParam}`,
      `https://vidsrc.me/${type}/${id}`,
      `https://vidsrc.stream/${type}/${id}`,
    ];

    for (const source of sources) {
      try {
        const response = await fetch(source, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const html = await response.text();

        const m3u8Match = html.match(/https:\/\/[^\s"']+\.m3u8[^\s"']*/);
        if (m3u8Match) {
          hlsUrl = m3u8Match[0];
          break;
        }

        const sourceMatch = html.match(/sources\s*:\s*\[([^\]]+)\]/);
        if (sourceMatch) {
          const fileMatch = sourceMatch[1].match(/file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/);
          if (fileMatch) {
            hlsUrl = fileMatch[1];
            break;
          }
        }
      } catch (e) {
        console.log(`Failed to fetch from ${source}`);
      }
    }

    if (hlsUrl) {
      return NextResponse.json({
        success: true,
        hlsUrl,
      });
    }

    return NextResponse.json({
      success: false,
      error: "No HLS stream found. Please enter manually.",
    });
  } catch (error) {
    console.error("Error generating HLS URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate HLS URL" },
      { status: 500 }
    );
  }
}
