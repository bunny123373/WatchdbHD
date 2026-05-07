import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import WatchProgress from "@/models/WatchProgress";
import { verifyToken } from "@/lib/auth";

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = verifyToken(authHeader.slice(7));
  return payload?.userId || null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    const query: Record<string, unknown> = { userId };
    if (contentId) query.contentId = contentId;

    const progress = await WatchProgress.find(query)
      .sort({ updatedAt: -1 })
      .populate("contentId", "title poster type slug year rating");

    return NextResponse.json({ success: true, data: progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { contentId, seasonNumber, episodeNumber, progress, duration } = body;

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "contentId is required" },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown> = { userId, contentId };
    if (seasonNumber !== undefined) filter.seasonNumber = seasonNumber;
    if (episodeNumber !== undefined) filter.episodeNumber = episodeNumber;

    const update = await WatchProgress.findOneAndUpdate(
      filter,
      {
        $set: {
          progress: progress ?? 0,
          duration: duration ?? 0,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: update });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "contentId is required" },
        { status: 400 }
      );
    }

    await WatchProgress.deleteMany({ userId, contentId });

    return NextResponse.json({ success: true, message: "Progress cleared" });
  } catch (error) {
    console.error("Error clearing progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear progress" },
      { status: 500 }
    );
  }
}
