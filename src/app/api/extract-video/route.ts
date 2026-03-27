import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const apiKey = process.env.CRAWL_API_KEY || process.env.RAPIDAPI_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key configured. Set CRAWL_API_KEY or RAPIDAPI_KEY in .env" },
        { status: 500 }
      );
    }

    const encodedUrl = encodeURIComponent(url);
    
    let videoUrl = "";
    let success = false;

    // Try multiple extraction methods
    
    // Method 1: Direct fetch (for simple cases)
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Referer": new URL(url).origin,
        },
      });
      
      const html = await response.text();
      
      // Look for video sources in the HTML
      const videoMatches = html.match(/(?:src|href)=["']([^"']+\.(?:mp4|m3u8|webm)[^"']*)["']/gi);
      if (videoMatches) {
        for (const match of videoMatches) {
          const urlMatch = match.match(/["']([^"']+)["']/);
          if (urlMatch) {
            let foundUrl = urlMatch[1];
            if (foundUrl.startsWith("//")) {
              foundUrl = "https:" + foundUrl;
            }
            if (foundUrl.includes(".mp4") || foundUrl.includes(".m3u8")) {
              videoUrl = foundUrl;
              success = true;
              break;
            }
          }
        }
      }
      
      // Look for player sources
      const playerMatches = html.match(/player\.src\([^)]+\)|videojs\([^)]+\)\.src\([^)]+\)/gi);
      if (!success && playerMatches) {
        for (const match of playerMatches) {
          const srcMatch = match.match(/src:\s*["']([^"']+)["']/);
          if (srcMatch) {
            videoUrl = srcMatch[1];
            success = true;
            break;
          }
        }
      }
    } catch (e) {
      console.log("Direct fetch failed:", e);
    }

    // Method 2: Use a video extraction API (like streamtape, vidguard, etc.)
    if (!success) {
      // Try using a simple extraction approach
      const extractApiUrl = `https://api.crawlbox.com/v1/extract?url=${encodedUrl}&apikey=${apiKey}`;
      
      try {
        const extractResponse = await fetch(extractApiUrl, {
          headers: { "Accept": "application/json" },
        });
        
        if (extractResponse.ok) {
          const data = await extractResponse.json();
          if (data.url || data.video_url || data.stream_url) {
            videoUrl = data.url || data.video_url || data.stream_url;
            success = true;
          }
        }
      } catch (e) {
        console.log("Extraction API failed:", e);
      }
    }

    // Method 3: Common embed patterns
    if (!success) {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Check if it's a known embed provider
      if (hostname.includes("streamtape")) {
        // Streamtape requires special handling
        const videoId = url.split("/").pop()?.replace(/\?.*/, "");
        if (videoId) {
          videoUrl = `https://streamtape.com/get_video/${videoId}`;
          success = true;
        }
      } else if (hostname.includes("dood")) {
        // Doodstream
        const videoId = url.split("/").pop()?.replace(/\?.*/, "");
        if (videoId) {
          videoUrl = `https://doodstream.com/d/${videoId}`;
          success = true;
        }
      }
    }

    if (success && videoUrl) {
      return NextResponse.json({
        success: true,
        url: videoUrl,
        originalUrl: url,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Could not extract video URL. The embed may be protected or unsupported.",
    });

  } catch (error) {
    console.error("Embed extraction error:", error);
    return NextResponse.json(
      { error: "Failed to process embed URL" },
      { status: 500 }
    );
  }
}
