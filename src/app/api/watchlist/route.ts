import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Watchlist from "@/models/Watchlist";
import { getUserFromRequest } from "@/lib/get-user";

export async function GET(request: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const watchlist = await Watchlist.find({ userId: userInfo.userId })
      .sort({ createdAt: -1 })
      .populate("contentId", "title poster type slug year rating banner");

    return NextResponse.json({ success: true, data: watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { contentId } = await request.json();
    if (!contentId) {
      return NextResponse.json(
        { success: false, error: "contentId is required" },
        { status: 400 }
      );
    }

    const existing = await Watchlist.findOne({ userId: userInfo.userId, contentId });
    if (existing) {
      return NextResponse.json({ success: true, data: existing, message: "Already in watchlist" });
    }

    const item = await Watchlist.create({ userId: userInfo.userId, contentId });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(request);
    if (!userInfo) {
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

    await Watchlist.findOneAndDelete({ userId: userInfo.userId, contentId });

    return NextResponse.json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
