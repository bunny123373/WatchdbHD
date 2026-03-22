import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const filename = searchParams.get("filename") || "download";

    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      return new NextResponse("Failed to fetch file", { status: 502 });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = `attachment; filename="${filename}"`;

    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "Content-Length": blob.size.toString(),
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Proxy download error:", error);
    return new NextResponse("Failed to download file", { status: 500 });
  }
}
