import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url, type, title } = await request.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 });
    }

    let downloadUrl = url;
    let filename = title || "download";

    if (url.includes("drive.google.com")) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/id=([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      }
    }

    else if (url.includes("dropbox.com")) {
      downloadUrl = url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?dl=1");
    }

    else if (url.includes("mediafire.com")) {
      const fileId = url.match(/mediafire\.com\/([a-zA-Z0-9]+)/)?.[1];
      if (fileId) {
        downloadUrl = `https://www.mediafire.com/file/${fileId}/${encodeURIComponent(title || "download")}/file`;
      }
    }

    else if (url.includes("pixeldrain.com")) {
      const fileId = url.match(/pixeldrain\.com\/[fu]\/([a-zA-Z0-9]+)/)?.[1];
      if (fileId) {
        downloadUrl = `https://pixeldrain.com/api/file/${fileId}?download`;
      }
    }

    else if (url.includes("1fichier.com")) {
      downloadUrl = url;
    }

    else if (url.includes("gofile.io")) {
      downloadUrl = url;
    }

    else if (url.match(/\.(mp4|mkv|avi|mov|webm|flv)$/i)) {
      const ext = url.match(/\.([a-z0-9]+)(\?|$)/i)?.[1] || "mp4";
      filename = `${title || "video"}.${ext}`;
    }

    else if (url.includes("vidsrc")) {
      const tmdbId = url.match(/tmdb[=:]([0-9]+)/i)?.[1];
      const imdbId = url.match(/imdb[=:]([a-zA-Z0-9]+)/i)?.[1];
      const isMovie = url.includes("/movie") && !url.includes("/tv");
      
      if (tmdbId || imdbId) {
        downloadUrl = `https://vidsrc.to/vapi/${isMovie ? "movie" : "tv"}/${tmdbId ? `tmdb/${tmdbId}` : `imdb/${imdbId}`}/360p`;
      }
    }

    return NextResponse.json({
      success: true,
      downloadUrl,
      filename,
      message: "Download URL generated"
    });
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json({ success: false, error: "Failed to generate download" }, { status: 500 });
  }
}
