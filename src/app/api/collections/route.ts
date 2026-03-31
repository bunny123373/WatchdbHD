import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Collection from "@/models/Collection";

export async function GET() {
  try {
    await connectDB();
    const collections = await Collection.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("contentIds", "title poster type year rating");
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, description, contentIds, isPublic, isTopTen } = body;

    if (!name || !contentIds || !Array.isArray(contentIds)) {
      return NextResponse.json({ error: "Name and contentIds required" }, { status: 400 });
    }

    const collection = await Collection.create({
      name,
      description,
      contentIds,
      isPublic: isPublic ?? true,
      isTopTen: isTopTen ?? false,
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, name, description, contentIds, isPublic, isTopTen } = body;

    if (!id) {
      return NextResponse.json({ error: "Collection ID required" }, { status: 400 });
    }

    const collection = await Collection.findByIdAndUpdate(
      id,
      { name, description, contentIds, isPublic, isTopTen },
      { new: true }
    );

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Collection ID required" }, { status: 400 });
    }

    const collection = await Collection.findByIdAndDelete(id);

    if (!collection) {
      return NextResponse.json({ error: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
