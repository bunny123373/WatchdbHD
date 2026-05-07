import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";
import User from "@/models/User";
import ConversionJob from "@/models/ConversionJob";
import Watchlist from "@/models/Watchlist";
import Review from "@/models/Review";
import { getUserFromRequest } from "@/lib/get-user";

export async function GET(request: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(request);
    const adminKey = request.headers.get("x-admin-key");

    const isAuthorized =
      userInfo?.isAdmin ||
      adminKey === process.env.ADMIN_KEY;

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const [
      totalMovies,
      totalSeries,
      trendingCount,
      totalUsers,
      totalConversionJobs,
      totalWatchlistItems,
      totalReviews,
    ] = await Promise.all([
      Content.countDocuments({ type: "movie" }),
      Content.countDocuments({ type: "series" }),
      Content.countDocuments({ category: "Trending" }),
      User.countDocuments(),
      ConversionJob.countDocuments(),
      Watchlist.countDocuments(),
      Review.countDocuments(),
    ]);

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
        totalUsers,
        totalConversionJobs,
        totalWatchlistItems,
        totalReviews,
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
