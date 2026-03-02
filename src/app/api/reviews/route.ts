import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Review from "@/models/Review";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get("contentId");

    if (!contentId) {
      return NextResponse.json(
        { error: "Content ID is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ contentId })
      .sort({ createdAt: -1 })
      .limit(50);

    const totalReviews = await Review.countDocuments({ contentId });
    const avgRating =
      totalReviews > 0
        ? (
            await Review.aggregate([
              { $match: { contentId: contentId } },
              { $group: { _id: null, avg: { $avg: "$rating" } } },
            ])
          )[0]?.avg || 0
        : 0;

    return NextResponse.json({
      reviews,
      stats: {
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { contentId, userName, rating, comment } = body;

    if (!contentId || !userName || !rating || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await Review.create({
      contentId,
      userName: userName.slice(0, 30),
      rating,
      comment: comment.slice(0, 500),
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
