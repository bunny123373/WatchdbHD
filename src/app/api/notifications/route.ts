import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get("x-admin-key");
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const notification = {
      id: Date.now().toString(),
      title: body.type === "movie" ? "New Movie Added" : "New Series Added",
      body: `${body.title} is now available to watch!`,
      time: "Just now",
      contentId: body._id,
      contentType: body.type,
    };

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [],
    message: "Use client-side localStorage for notifications"
  });
}
