import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Check next-auth session first
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as Record<string, unknown> | undefined;
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
