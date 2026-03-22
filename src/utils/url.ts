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
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename || url.split("/").pop() || "download")}`;
    window.open(proxyUrl, "_blank");
  } catch (error) {
    window.open(url, "_blank");
  }
}
