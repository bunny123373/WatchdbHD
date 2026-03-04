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
