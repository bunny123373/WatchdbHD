import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type");
    const genreId = searchParams.get("genreId");
    const language = searchParams.get("language");
    const year = searchParams.get("year");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    if (!q?.trim() && !genreId && !language && !year) {
      return NextResponse.json(
        { success: false, error: "At least one search parameter is required" },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (genreId) {
      query.tmdbGenreIds = parseInt(genreId);
    }

    if (language) {
      query.language = language;
    }

    if (year) {
      query.year = year;
    }

    if (q?.trim()) {
      const searchRegex = new RegExp(q.trim(), "i");
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } },
        { tmdbGenres: { $in: [searchRegex] } },
        { category: { $regex: searchRegex } },
        { "cast.name": { $regex: searchRegex } },
        { "crew.name": { $regex: searchRegex } },
      ];
    }

    const skip = (page - 1) * limit;
    const [content, total] = await Promise.all([
      Content.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Content.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + content.length < total,
      },
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search content" },
      { status: 500 }
    );
  }
}
