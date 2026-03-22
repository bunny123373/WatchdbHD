import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let url = searchParams.get("url");
    const filename = searchParams.get("filename");

    if (!url) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    url = decodeURIComponent(url);
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const isVideo = contentType.startsWith("video/") || contentType.startsWith("audio/");
    const isLargeFile = parseInt(response.headers.get("content-length") || "0") > 50 * 1024 * 1024;

    if (isVideo && isLargeFile) {
      return NextResponse.redirect(url);
    }

    const blob = await response.blob();
    const downloadFilename = filename || url.split("/").pop()?.split("?")[0]?.substring(0, 50) || "download";

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
    return NextResponse.redirect(new URL("/", request.url));
  }
}
