import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const decodedUrl = decodeURIComponent(url);
    const urlObj = new URL(decodedUrl);
    
    if (!decodedUrl.startsWith("http://") && !decodedUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": urlObj.origin,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch embed" }, { status: 502 });
    }

    const html = await response.text();

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Embed proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy embed" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
