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

export interface ParsedSource {
  name: string;
  url: string;
  quality?: string;
}

export interface ParsedMultiSource {
  sources: ParsedSource[];
  hasQuality: boolean;
}

const SOURCE_REGEX = /\[([^\]]+)\]\{([^}]+)\}([^;]+)|\{([^}]+)\}([^;]+)/g;

export function parseMultiSourceFile(fileString: string): ParsedMultiSource {
  if (!fileString || !fileString.includes(";")) {
    return { sources: [], hasQuality: false };
  }

  const sources: ParsedSource[] = [];
  let hasQuality = false;
  
  const regex = /\[([^\]]+)\]\{([^}]+)\}([^;]+)|\{([^}]+)\}([^;]+)/g;
  let match;
  
  while ((match = regex.exec(fileString)) !== null) {
    if (match[1] !== undefined) {
      hasQuality = true;
      sources.push({
        quality: match[1].trim(),
        name: match[2].trim(),
        url: match[3].trim(),
      });
    } else if (match[4] !== undefined) {
      sources.push({
        name: match[4].trim(),
        url: match[5].trim(),
      });
    }
  }

  return { sources, hasQuality };
}

export function groupSourcesByQuality(sources: ParsedSource[]): Map<string, ParsedSource[]> {
  const grouped = new Map<string, ParsedSource[]>();
  
  for (const source of sources) {
    const quality = source.quality || "default";
    if (!grouped.has(quality)) {
      grouped.set(quality, []);
    }
    grouped.get(quality)!.push(source);
  }
  
  return grouped;
}
