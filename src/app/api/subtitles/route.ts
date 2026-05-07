import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subtitle from "@/models/Subtitle";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");
    const seasonNumber = searchParams.get("seasonNumber");
    const episodeNumber = searchParams.get("episodeNumber");

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "contentId is required" },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = { contentId };
    if (seasonNumber) query.seasonNumber = parseInt(seasonNumber);
    if (episodeNumber) query.episodeNumber = parseInt(episodeNumber);

    const subtitles = await Subtitle.find(query).sort({ language: 1 });

    return NextResponse.json({ success: true, data: subtitles });
  } catch (error) {
    console.error("Error fetching subtitles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subtitles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { contentId, seasonNumber, episodeNumber, language, label, url, format } = body;

    if (!contentId || !language || !label || !url || !format) {
      return NextResponse.json(
        { success: false, error: "contentId, language, label, url, and format are required" },
        { status: 400 }
      );
    }

    if (!["srt", "vtt"].includes(format)) {
      return NextResponse.json(
        { success: false, error: "Format must be srt or vtt" },
        { status: 400 }
      );
    }

    const subtitle = await Subtitle.create({
      contentId,
      seasonNumber: seasonNumber || undefined,
      episodeNumber: episodeNumber || undefined,
      language,
      label,
      url,
      format,
    });

    return NextResponse.json({ success: true, data: subtitle }, { status: 201 });
  } catch (error) {
    console.error("Error adding subtitle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add subtitle" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Subtitle id is required" },
        { status: 400 }
      );
    }

    await Subtitle.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Subtitle deleted" });
  } catch (error) {
    console.error("Error deleting subtitle:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete subtitle" },
      { status: 500 }
    );
  }
}
