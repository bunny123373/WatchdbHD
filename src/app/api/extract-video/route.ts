import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    let videoUrl = "";
    let success = false;

    // Method 1: Direct fetch (for simple cases)
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": new URL(url).origin,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        
        // Direct video file
        if (contentType.includes("video") || url.match(/\.(mp4|mkv|webm|avi|mov)$/i)) {
          videoUrl = url;
          success = true;
        } else {
          const html = await response.text();

          // Look for video/source tags
          const videoMatches = html.match(/(?:src|file)=["']([^"']+)["']/gi);
          if (videoMatches) {
            for (const match of videoMatches) {
              const urlMatch = match.match(/["']([^"']+)["']/);
              if (urlMatch) {
                let foundUrl = urlMatch[1];
                if (foundUrl.startsWith("//")) {
                  foundUrl = "https:" + foundUrl;
                }
                if (foundUrl.match(/\.(mp4|m3u8|webm|mkv)/i)) {
                  videoUrl = foundUrl;
                  success = true;
                  break;
                }
              }
            }
          }

          // Look for player configurations
          if (!success) {
            const configMatches = html.match(/player\.src\([^)]+\)/gi);
            if (configMatches) {
              const srcMatch = configMatches[0].match(/src:\s*["']([^"']+)["']/);
              if (srcMatch) {
                videoUrl = srcMatch[1];
                success = true;
              }
            }
          }
        }
      }
    } catch (e) {
      console.log("Direct fetch failed:", e);
    }

    // Method 2: Common embed patterns (Streamtape, Doodstream, etc.)
    if (!success) {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();

        if (hostname.includes("streamtape")) {
          const videoId = url.split("/").pop()?.split("?")[0];
          if (videoId && videoId.length > 5) {
            videoUrl = `https://streamtape.com/get_video/${videoId}`;
            success = true;
          }
        } else if (hostname.includes("dood") || hostname.includes("doodstream")) {
          const videoId = url.split("/").pop()?.split("?")[0];
          if (videoId && videoId.length > 5) {
            videoUrl = `https://doodstream.com/d/${videoId}`;
            success = true;
          }
        } else if (hostname.includes("mixdrop")) {
          const videoId = url.split("/").pop()?.split("?")[0];
          if (videoId && videoId.length > 5) {
            videoUrl = `https://mixdrop.co/e/${videoId}`;
            success = true;
          }
        } else if (hostname.includes("vidguard") || hostname.includes("vgfplay")) {
          const videoId = url.split("/").pop()?.split("?")[0];
          if (videoId && videoId.length > 5) {
            videoUrl = `https://vidguard.com/v/${videoId}`;
            success = true;
          }
        } else if (hostname.includes("filemoon")) {
          const videoId = url.split("/").pop()?.split("?")[0];
          if (videoId && videoId.length > 5) {
            videoUrl = `https://filemoon.sx/e/${videoId}`;
            success = true;
          }
        }
      } catch (e) {
        console.log("URL parse failed:", e);
      }
    }

    // Method 3: Try API key if configured
    if (!success) {
      const apiKey = process.env.CRAWL_API_KEY;
      if (apiKey) {
        try {
          const encodedUrl = encodeURIComponent(url);
          const extractApiUrl = `https://api.crawlbox.com/v1/extract?url=${encodedUrl}&apikey=${apiKey}`;
          const extractResponse = await fetch(extractApiUrl, { headers: { "Accept": "application/json" } });
          
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
      error: "Could not extract video URL. The embed may be protected or not supported.",
    });

  } catch (error) {
    console.error("Embed extraction error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process embed URL" },
      { status: 500 }
    );
  }
}
