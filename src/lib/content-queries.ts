import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";

export function resolveContentIdFromSlug(slug: string) {
  const normalized = (slug || "").trim();
  if (!normalized) return normalized;

  const maybeId = normalized.split("-").pop() || normalized;
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(maybeId) ? maybeId : normalized;
}

export async function getContentById(id: string) {
  try {
    await dbConnect();
    const content = await Content.findById(id).lean() as unknown as Record<string, unknown> | null;
    if (!content) return null;

    return {
      _id: String(content._id || ""),
      title: String(content.title || ""),
      poster: String(content.poster || ""),
      banner: content.banner ? String(content.banner) : "",
      description: content.description ? String(content.description) : "",
      year: content.year ? String(content.year) : "",
      rating: content.rating != undefined ? Number(content.rating) : undefined,
      quality: content.quality ? String(content.quality) : "",
      language: content.language ? String(content.language) : "",
      audioLanguages: Array.isArray(content.audioLanguages) ? content.audioLanguages.map(String) : [],
      runtime: content.runtime ? String(content.runtime) : "",
      type: String(content.type || "movie"),
      tags: Array.isArray(content.tags) ? content.tags.map(String) : [],
      embedIframeLink: content.embedIframeLink ? String(content.embedIframeLink) : "",
      embedIframeLink2: content.embedIframeLink2 ? String(content.embedIframeLink2) : "",
      downloadLink: content.downloadLink ? String(content.downloadLink) : "",
      hlsUrl: content.hlsUrl ? String(content.hlsUrl) : "",
      seasons: Array.isArray(content.seasons) ? content.seasons : [],
      category: content.category ? String(content.category) : "",
      tmdbId: content.tmdbId != undefined ? Number(content.tmdbId) : undefined,
      tmdbGenreIds: Array.isArray(content.tmdbGenreIds) ? content.tmdbGenreIds.map(Number) : undefined,
      tmdbGenres: Array.isArray(content.tmdbGenres) ? content.tmdbGenres.map(String) : undefined,
      cast: Array.isArray(content.cast) ? content.cast : [],
      crew: Array.isArray(content.crew) ? content.crew : [],
      trailerUrl: content.trailerUrl ? String(content.trailerUrl) : undefined,
      views: content.views != undefined ? Number(content.views) : 0,
      autoPlay: content.autoPlay || false,
      languageEmbeds: Array.isArray(content.languageEmbeds) ? content.languageEmbeds : [],
      createdAt: content.createdAt ? new Date(content.createdAt as string) : new Date(),
      updatedAt: content.updatedAt ? new Date(content.updatedAt as string) : new Date(),
    } as unknown as IContent;
  } catch (error) {
    console.error("Failed to fetch content:", error);
    return null;
  }
}
