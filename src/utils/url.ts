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

const AUDIO_EXTENSIONS = [".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac"];

export function isDirectFileUrl(url: string): boolean {
  const directExtensions = [".mp4", ".mkv", ".avi", ".mov", ".webm", ".m3u8", ...AUDIO_EXTENSIONS];
  const lowerUrl = url.toLowerCase();
  return directExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes("stream");
}

export function isAudioFileUrl(url: string): boolean {
  const lowerUrl = (url || "").toLowerCase();
  return AUDIO_EXTENSIONS.some(ext => lowerUrl.includes(ext));
}

export function getFileExtension(url: string): string {
  const lowerUrl = (url || "").toLowerCase();
  for (const ext of [...AUDIO_EXTENSIONS, ".mp4", ".mkv", ".avi", ".mov", ".webm", ".m3u8"]) {
    if (lowerUrl.includes(ext)) {
      return ext;
    }
  }
  return "";
}

export async function downloadFile(url: string, filename?: string): Promise<void> {
  try {
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename || url.split("/").pop() || "download")}`;
    window.open(proxyUrl, "_blank");
  } catch (error) {
    window.open(url, "_blank");
  }
}
