import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import Report from "@/models/Report";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "true";

    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .limit(admin ? 100 : 0);

    const stats = {
      total: await Report.countDocuments(),
      pending: await Report.countDocuments({ status: "pending" }),
      fixed: await Report.countDocuments({ status: "fixed" }),
      rejected: await Report.countDocuments({ status: "rejected" }),
    };

    return NextResponse.json({ reports, stats });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { contentId, contentTitle, type, episodeNumber, seasonNumber, issueType, description } = body;

    if (!contentId || !contentTitle || !type || !issueType) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const report = await Report.create({
      contentId,
      contentTitle,
      type,
      episodeNumber,
      seasonNumber,
      issueType,
      description: description?.slice(0, 500),
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
