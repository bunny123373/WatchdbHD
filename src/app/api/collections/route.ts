import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Collection from "@/models/Collection";

export async function GET() {
  try {
    await dbConnect();
    const collections = await Collection.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("contentIds", "title poster type");
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
    const { name, description, contentIds, isPublic } = body;

    if (!name || !contentIds || !Array.isArray(contentIds)) {
      return NextResponse.json({ error: "Name and contentIds required" }, { status: 400 });
    }

    const collection = await Collection.create({
      name,
      description,
      contentIds,
      isPublic: isPublic ?? true,
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
