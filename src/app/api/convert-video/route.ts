import { NextRequest, NextResponse } from "next/server";
import { convertMp4ToHls } from "@/lib/video-converter";
import * as path from "path";
import * as fs from "fs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mp4Url, contentId, quality } = body;

    if (!mp4Url) {
      return NextResponse.json(
        { error: "MP4 URL is required" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "hls", contentId || "temp");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const result = await convertMp4ToHls({
      inputUrl: mp4Url,
      outputDir: uploadDir,
      quality: quality || [
        { label: "1080p", height: 1080, bitrate: "5000k" },
        { label: "720p", height: 720, bitrate: "2800k" },
        { label: "480p", height: 480, bitrate: "1400k" },
      ],
      onProgress: (progress) => {
        console.log(`Conversion progress: ${progress.percentage}% - ${progress.message}`);
      },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        hlsUrl: `/hls/${path.basename(uploadDir)}/hls/index.m3u8`,
        audioTracks: result.audioTracks,
        message: "Video converted successfully",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Conversion failed" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Conversion API error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Video conversion API",
    usage: "POST with { mp4Url: string, contentId?: string, quality?: [] }",
  });
}