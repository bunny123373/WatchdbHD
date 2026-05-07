import { NextRequest, NextResponse } from "next/server";
import { convertMp4ToHls } from "@/lib/video-converter";
import * as path from "path";
import * as fs from "fs";
import connectDB from "@/lib/mongodb";
import ConversionJob from "@/models/ConversionJob";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mp4Url, contentId, quality, jobId } = body;

    if (!mp4Url) {
      return NextResponse.json(
        { error: "MP4 URL is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let job = null;
    if (jobId) {
      job = await ConversionJob.findById(jobId);
    }
    if (!job && contentId) {
      job = await ConversionJob.findOne({
        contentId,
        status: { $in: ["pending", "downloading", "converting", "processing"] },
      });
    }
    if (!job) {
      job = await ConversionJob.create({
        contentId,
        mp4Url,
        status: "pending",
        progress: 0,
        message: "Starting conversion...",
      });
    }

    await ConversionJob.findByIdAndUpdate(job._id, {
      $set: { status: "downloading", progress: 0, message: "Starting conversion..." },
    });

    const uploadDir = path.join(process.cwd(), "public", "hls", contentId || String(job._id));

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
      onProgress: async (progress) => {
        const statusMap: Record<string, "downloading" | "converting" | "processing" | "complete"> = {
          downloading: "downloading",
          converting: "converting",
          processing: "processing",
          complete: "complete",
        };
        await ConversionJob.findByIdAndUpdate(job!._id, {
          $set: {
            status: statusMap[progress.stage] || "processing",
            progress: Math.round(progress.percentage),
            message: progress.message,
          },
        }).catch(() => {});
      },
    });

    if (result.success) {
      const hlsUrl = `/hls/${path.basename(uploadDir)}/hls/index.m3u8`;
      await ConversionJob.findByIdAndUpdate(job._id, {
        $set: {
          status: "complete",
          progress: 100,
          message: "Conversion complete!",
          hlsUrl,
        },
      });

      return NextResponse.json({
        success: true,
        jobId: job._id,
        hlsUrl,
        audioTracks: result.audioTracks,
        message: "Video converted successfully",
      });
    } else {
      await ConversionJob.findByIdAndUpdate(job._id, {
        $set: {
          status: "failed",
          error: result.error || "Conversion failed",
          message: "Conversion failed",
        },
      });

      return NextResponse.json(
        { error: result.error || "Conversion failed", jobId: job._id },
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
    usage: "POST with { mp4Url: string, contentId?: string, quality?: [], jobId?: string }",
  });
}