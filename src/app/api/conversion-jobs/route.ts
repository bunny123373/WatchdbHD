import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ConversionJob from "@/models/ConversionJob";

export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));

    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const jobs = await ConversionJob.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error fetching conversion jobs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { mp4Url, contentId } = await request.json();

    if (!mp4Url) {
      return NextResponse.json(
        { success: false, error: "mp4Url is required" },
        { status: 400 }
      );
    }

    const job = await ConversionJob.create({
      contentId,
      mp4Url,
      status: "pending",
      progress: 0,
      message: "Queued for conversion",
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversion job:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create job" },
      { status: 500 }
    );
  }
}
