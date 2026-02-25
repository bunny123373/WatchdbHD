import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";

// GET /api/admin/stats - Get admin dashboard stats
export async function GET(request: NextRequest) {
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

    const totalMovies = await Content.countDocuments({ type: "movie" });
    const totalSeries = await Content.countDocuments({ type: "series" });
    const trendingCount = await Content.countDocuments({ category: "Trending" });

    // Count total episodes across all series
    const seriesData = await Content.find({ type: "series" }, { seasons: 1 });
    const totalEpisodes = seriesData.reduce((acc: number, series: { seasons?: { episodes?: { length: number }[] }[] }) => {
      return (
        acc +
        (series.seasons?.reduce((seasonAcc: number, season: { episodes?: { length: number }[] }) => {
          return seasonAcc + (season.episodes?.length || 0);
        }, 0) || 0)
      );
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalMovies,
        totalSeries,
        totalEpisodes,
        trendingCount,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
