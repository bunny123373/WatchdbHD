import { NextRequest, NextResponse } from "next/server";
import { createApiVideoService } from "@/lib/api-video";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mp4Url, title, contentId } = body;

    if (!mp4Url) {
      return NextResponse.json({ error: "MP4 URL is required" }, { status: 400 });
    }

    const apiVideo = createApiVideoService();

    if (!apiVideo) {
      return NextResponse.json(
        { error: "API_VIDEO_API_KEY not configured. Please add to .env.local" },
        { status: 500 }
      );
    }

    console.log(`Uploading ${mp4Url} to api.video...`);

    const result = await apiVideo.uploadFromUrl(mp4Url, title || `Video ${contentId}`);

    if (result.success) {
      return NextResponse.json({
        success: true,
        videoId: result.videoId,
        hlsUrl: result.hlsUrl,
        assets: result.assets,
        audioTracks: result.sourceAudioTracks,
        message: "Video uploaded and converted to HLS successfully!",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload API error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "api.video Upload API",
    usage: "POST with { mp4Url: string, title?: string, contentId?: string }",
    envRequired: "API_VIDEO_API_KEY",
  });
}