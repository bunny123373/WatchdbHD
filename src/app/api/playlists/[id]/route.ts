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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();

    const playlist = await Playlist.findById(id)
      .populate("userId", "username avatar")
      .populate("items.contentId", "title poster type slug year rating banner description");

    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found" },
        { status: 404 }
      );
    }

    if (!playlist.isPublic) {
      const userId = getUserId(request);
      if (!userId || String(playlist.userId._id || playlist.userId) !== userId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json({ success: true, data: playlist });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found" },
        { status: 404 }
      );
    }

    if (String(playlist.userId) !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const allowed = ["name", "description", "isPublic", "items"];
    const updates: Record<string, unknown> = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    const updated = await Playlist.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("items.contentId", "title poster type slug year rating");

    return NextResponse.json({ success: true, data: updated, message: "Playlist updated" });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update playlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found" },
        { status: 404 }
      );
    }

    if (String(playlist.userId) !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await Playlist.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Playlist deleted" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete playlist" },
      { status: 500 }
    );
  }
}
