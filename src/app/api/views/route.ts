import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json({ error: "Content ID required" }, { status: 400 });
    }

    await Content.findByIdAndUpdate(contentId, { $inc: { views: 1 } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error incrementing views:", error);
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 });
  }
}
