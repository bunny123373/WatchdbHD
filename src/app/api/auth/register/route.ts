import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User with this email or username already exists" },
        { status: 409 }
      );
    }

    const { hash } = await import("@/lib/auth");
    const hashedPassword = await hash(password);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = createToken({ userId: String(user._id), isAdmin: user.isAdmin });

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        preferences: user.preferences,
      },
      token,
    }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register" },
      { status: 500 }
    );
  }
}
