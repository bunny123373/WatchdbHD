import { NextResponse } from "next/server";
import { getAccountInfo, getFileList, getFileInfo, remoteUpload, deleteFile } from "@/lib/lulustream";

const API_KEY = process.env.LULUSTREAM_API_KEY;

export async function GET(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: "Lulustream API key not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const fileCode = searchParams.get("fileCode");

  try {
    switch (action) {
      case "account":
        const accountInfo = await getAccountInfo();
        if (!accountInfo) {
          return NextResponse.json(
            { success: false, error: "Failed to get account info" },
            { status: 500 }
          );
        }
        return NextResponse.json({ success: true, data: accountInfo });

      case "files":
        const files = await getFileList();
        return NextResponse.json({ success: true, data: files });

      case "info":
        if (!fileCode) {
          return NextResponse.json(
            { success: false, error: "File code required" },
            { status: 400 }
          );
        }
        const fileInfo = await getFileInfo(fileCode);
        if (!fileInfo) {
          return NextResponse.json(
            { success: false, error: "File not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: fileInfo });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Lulustream API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: "Lulustream API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action, url, title, fileCode } = body;

    switch (action) {
      case "remote-upload":
        if (!url) {
          return NextResponse.json(
            { success: false, error: "URL required" },
            { status: 400 }
          );
        }
        const uploadResult = await remoteUpload(url, title);
        if (!uploadResult) {
          return NextResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 }
          );
        }
        return NextResponse.json({ success: true, data: uploadResult });

      case "delete":
        if (!fileCode) {
          return NextResponse.json(
            { success: false, error: "File code required" },
            { status: 400 }
          );
        }
        const deleteResult = await deleteFile(fileCode);
        return NextResponse.json({ success: deleteResult });

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Lulustream API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
