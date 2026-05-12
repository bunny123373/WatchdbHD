import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";
import { generateSlug } from "@/lib/slug";

// GET /api/content - Get all content (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const language = searchParams.get("language");
    const search = searchParams.get("search");
    const genreId = searchParams.get("genreId");
    const ids = searchParams.get("ids");

    let query: Record<string, unknown> = {};

    if (ids) {
      query._id = { $in: ids.split(",") };
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (language) {
      query.language = language;
    }

    if (genreId) {
      query.tmdbGenreIds = parseInt(genreId);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
        { tmdbGenres: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const noLimit = searchParams.get("noLimit") === "true";
    let queryBuilder = Content.find(query).sort({ createdAt: -1 }).lean();
    if (!noLimit) {
      queryBuilder = queryBuilder.limit(50);
    }
    const content = await queryBuilder;
    const data = content.map((item: Record<string, unknown>) => {
      if (!item.slug && item.title) {
        item.slug = generateSlug(item.title as string);
        try {
          Content.findByIdAndUpdate(item._id, { slug: item.slug }).exec();
        } catch (_) {}
      }
      return item;
    });

    return NextResponse.json({
      success: true,
      data,
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

    // For movies, downloadLink is optional
    // if (body.type === "movie" && !body.downloadLink) {
    //   return NextResponse.json(
    //     { success: false, error: "Download link is required for movies" },
    //     { status: 400 }
    //   );
    // }

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

        // Download links are now optional for episodes
        // for (const episode of season.episodes) {
        //   if (!episode.downloadLink) {
        //     return NextResponse.json(
        //       { success: false, error: "Each episode must have a download link" },
        //       { status: 400 }
        //     );
        //   }
        // }
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
