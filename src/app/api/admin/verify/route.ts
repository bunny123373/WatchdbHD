import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Check next-auth session first (wrapped in try-catch to handle missing env)
    let sessionUser: Record<string, unknown> | undefined;
    try {
      const session = await getServerSession(authOptions);
      sessionUser = session?.user as Record<string, unknown> | undefined;
    } catch {
      // next-auth not configured, fall through to key check
    }

    if (sessionUser?.isAdmin) {
      return NextResponse.json({
        success: true,
        message: "Admin verified via session",
        method: "session",
      });
    }

    // Fall back to admin key
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Admin key is required" },
        { status: 400 }
      );
    }

    if (key === process.env.ADMIN_KEY) {
      return NextResponse.json({
        success: true,
        message: "Admin key verified",
        method: "key",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid admin key" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error verifying admin:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify admin" },
      { status: 500 }
    );
  }
}
