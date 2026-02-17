import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";

// GET /api/content - Get all content (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const language = searchParams.get("language");
    const search = searchParams.get("search");

    let query: Record<string, unknown> = {};

    if (type && type !== "all") {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (language) {
      query.language = language;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const content = await Content.find(query).sort({ createdAt: -1 }).limit(50);

    return NextResponse.json({
      success: true,
      data: content,
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch content", details: message },
      { status: 500 }
    );
  }
}

// POST /api/content - Create new content (admin protected)
export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.type || !body.title || !body.poster) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // For movies, downloadLink is required
    if (body.type === "movie" && !body.downloadLink) {
      return NextResponse.json(
        { success: false, error: "Download link is required for movies" },
        { status: 400 }
      );
    }

    // For series, seasons with episodes are required
    if (body.type === "series") {
      if (!body.seasons || body.seasons.length === 0) {
        return NextResponse.json(
          { success: false, error: "At least one season is required for series" },
          { status: 400 }
        );
      }

      for (const season of body.seasons) {
        if (!season.episodes || season.episodes.length === 0) {
          return NextResponse.json(
            { success: false, error: "Each season must have at least one episode" },
            { status: 400 }
          );
        }

        for (const episode of season.episodes) {
          if (!episode.downloadLink) {
            return NextResponse.json(
              { success: false, error: "Each episode must have a download link" },
              { status: 400 }
            );
          }
        }
      }
    }

    const content = await Content.create(body);

    return NextResponse.json(
      {
        success: true,
        data: content,
        message: "Content created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create content" },
      { status: 500 }
    );
  }
}
