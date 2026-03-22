import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get("url");
    const filename = searchParams.get("filename");

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    url = decodeURIComponent(url);
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentLength = response.headers.get("content-length");
    const isVideo = contentType.startsWith("video/") || contentType.startsWith("audio/");
    const fileSize = contentLength ? parseInt(contentLength) : 0;

    if (isVideo && fileSize > 100 * 1024 * 1024) {
      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", `attachment; filename="${filename || "video.mp4"}"`);
      headers.set("Content-Length", contentLength || "");
      headers.set("Accept-Ranges", "bytes");
      headers.set("Cache-Control", "no-cache");
      
      return new NextResponse(response.body, { headers });
    }

    const blob = await response.blob();
    const downloadFilename = filename || url.split("/").pop()?.split("?")[0]?.substring(0, 100) || "download";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadFilename}"`,
        "Content-Length": blob.size.toString(),
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Proxy download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};
