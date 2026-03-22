export function normalizeExternalUrl(url?: string | null): string {
  const value = (url || "").trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value) || /^magnet:/i.test(value)) {
    return value;
  }

  if (/^\/\//.test(value)) {
    return `https:${value}`;
  }

  return `https://${value.replace(/^\/+/, "")}`;
}

export function isDirectFileUrl(url: string): boolean {
  const directExtensions = [".mp4", ".mkv", ".avi", ".mov", ".webm", ".m3u8"];
  const lowerUrl = url.toLowerCase();
  return directExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes("stream");
}

export async function downloadFile(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || url.split("/").pop() || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    window.open(url, "_blank");
  }
}
