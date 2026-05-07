import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Playlist from "@/models/Playlist";
import { verifyToken } from "@/lib/auth";

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const payload = verifyToken(authHeader.slice(7));
  return payload?.userId || null;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get("public") === "true";

    if (publicOnly) {
      const playlists = await Playlist.find({ isPublic: true })
        .sort({ updatedAt: -1 })
        .populate("userId", "username avatar")
        .populate("items.contentId", "title poster type slug year rating");

      return NextResponse.json({ success: true, data: playlists });
    }

    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const playlists = await Playlist.find({ userId })
      .sort({ updatedAt: -1 })
      .populate("items.contentId", "title poster type slug year rating");

    return NextResponse.json({ success: true, data: playlists });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch playlists" },
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
    const { name, description, isPublic, contentIds } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Playlist name is required" },
        { status: 400 }
      );
    }

    const items = Array.isArray(contentIds)
      ? contentIds.map((id: string, index: number) => ({
          contentId: id,
          order: index,
        }))
      : [];

    const playlist = await Playlist.create({
      userId,
      name: name.trim(),
      description,
      isPublic: isPublic ?? false,
      items,
    });

    return NextResponse.json({ success: true, data: playlist }, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
