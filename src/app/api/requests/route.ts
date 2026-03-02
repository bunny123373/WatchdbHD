import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbconnect";
import ContentRequest from "@/models/ContentRequest";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin") === "true";

    const requests = await ContentRequest.find({})
      .sort({ createdAt: -1 })
      .limit(admin ? 100 : 50);

    const stats = {
      total: await ContentRequest.countDocuments(),
      pending: await ContentRequest.countDocuments({ status: "pending" }),
      completed: await ContentRequest.countDocuments({ status: "completed" }),
      rejected: await ContentRequest.countDocuments({ status: "rejected" }),
    };

    return NextResponse.json({ requests, stats });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { title, type, year, language, description } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Title and type are required" },
        { status: 400 }
      );
    }

    const contentRequest = await ContentRequest.create({
      title: title.slice(0, 200),
      type,
      year: year?.slice(0, 10),
      language: language?.slice(0, 50),
      description: description?.slice(0, 500),
    });

    return NextResponse.json({ request: contentRequest }, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
