import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

interface UserInfo {
  userId: string;
  isAdmin: boolean;
}

export async function getUserFromRequest(request: NextRequest): Promise<UserInfo | null> {
  // Try next-auth session first
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as Record<string, unknown> | undefined;
    if (sessionUser?.id) {
      const userId = String(sessionUser.id);
      const isAdmin = Boolean(sessionUser.isAdmin);
      return { userId, isAdmin };
    }
  } catch {
    // next-auth not available, fall through
  }

  // Fall back to Bearer token
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyToken(authHeader.slice(7));
    if (payload) {
      return { userId: payload.userId, isAdmin: payload.isAdmin };
    }
  }

  return null;
}

export async function getDbUserFromRequest(request: NextRequest) {
  const info = await getUserFromRequest(request);
  if (!info) return null;

  try {
    await connectDB();
    const user = await User.findById(info.userId).select("-password");
    return user;
  } catch {
    return null;
  }
}
