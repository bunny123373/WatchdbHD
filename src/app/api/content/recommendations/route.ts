import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const language = searchParams.get("language");
    const category = searchParams.get("category");
    const exclude = searchParams.get("exclude");

    let query: Record<string, unknown> = {};

    if (language) {
      query.language = language;
    }

    if (category) {
      query.category = category;
    }

    if (exclude) {
      query._id = { $ne: exclude };
    }

    const contents = await Content.find(query)
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .select("title poster quality year language _id");

    return NextResponse.json({
      success: true,
      contents,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}