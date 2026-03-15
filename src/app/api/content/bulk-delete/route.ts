import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Content from "@/models/Content";

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

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "No IDs provided" },
        { status: 400 }
      );
    }

    const result = await Content.deleteMany({
      _id: { $in: ids },
    });

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} items deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
