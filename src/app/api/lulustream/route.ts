import { NextRequest, NextResponse } from "next/server";

const LULUSTREAM_API = "https://lulustream.com";
const LULUSTREAM_KEY = process.env.LULUSTREAM_API_KEY;

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action");

  if (!LULUSTREAM_KEY) {
    return NextResponse.json(
      { success: false, error: "LULUSTREAM_API_KEY not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  try {
    if (action === "account") {
      const response = await fetch(`${LULUSTREAM_API}/api/account/info`, {
        headers: {
          "Authorization": LULUSTREAM_KEY,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { success: false, error: `Failed to connect: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    if (action === "files") {
      const response = await fetch(`${LULUSTREAM_API}/api/files/list`, {
        headers: {
          "Authorization": LULUSTREAM_KEY,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { success: false, error: `Failed to fetch files: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data: data.files || [] });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Lulustream API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to Lulustream. Check API key." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!LULUSTREAM_KEY) {
    return NextResponse.json(
      { success: false, error: "LULUSTREAM_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { action, url, title, fileCode } = body;

    if (action === "remote-upload") {
      if (!url) {
        return NextResponse.json({ success: false, error: "No URL provided" }, { status: 400 });
      }

      const response = await fetch(`${LULUSTREAM_API}/api/upload/remote`, {
        method: "POST",
        headers: {
          "Authorization": LULUSTREAM_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, title }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { success: false, error: `Upload failed: ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    if (action === "delete") {
      if (!fileCode) {
        return NextResponse.json({ success: false, error: "No file code provided" }, { status: 400 });
      }

      const response = await fetch(`${LULUSTREAM_API}/api/files/delete`, {
        method: "POST",
        headers: {
          "Authorization": LULUSTREAM_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_code: fileCode }),
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: "Delete failed" },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Lulustream API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to connect to Lulustream" },
      { status: 500 }
    );
  }
}
