import { Metadata } from "next";
import { notFound } from "next/navigation";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import SeriesDetailsClient from "./SeriesDetailsClient";
import { SITE_CONFIG } from "@/utils/constants";

function resolveSeriesIdFromSlug(slug: string) {
  const normalized = (slug || "").trim();
  if (!normalized) return normalized;

  // Supports `/series/title-here-<mongoId>` while keeping `/series/<mongoId>` valid.
  const maybeId = normalized.split("-").pop() || normalized;
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(maybeId) ? maybeId : normalized;
}

async function getSeries(id: string) {
  try {
    await dbConnect();
    const series = await Content.findById(id).lean() as unknown as Record<string, unknown> | null;
    if (!series) return null;
    
    return {
      _id: String(series._id || ""),
      title: String(series.title || ""),
      poster: String(series.poster || ""),
      banner: series.banner ? String(series.banner) : "",
      description: series.description ? String(series.description) : "",
      year: series.year ? String(series.year) : "",
      rating: series.rating != undefined ? Number(series.rating) : undefined,
      quality: series.quality ? String(series.quality) : "",
      language: series.language ? String(series.language) : "",
      audioLanguages: Array.isArray(series.audioLanguages) ? series.audioLanguages.map(String) : [],
      type: String(series.type || "series"),
      tags: Array.isArray(series.tags) ? series.tags.map(String) : [],
      seasons: Array.isArray(series.seasons) ? series.seasons : [],
      category: series.category ? String(series.category) : "",
      tmdbId: series.tmdbId != undefined ? Number(series.tmdbId) : undefined,
      tmdbGenreIds: Array.isArray(series.tmdbGenreIds) ? series.tmdbGenreIds.map(Number) : undefined,
      tmdbGenres: Array.isArray(series.tmdbGenres) ? series.tmdbGenres.map(String) : undefined,
      createdAt: series.createdAt ? new Date(series.createdAt as string) : new Date(),
      updatedAt: series.updatedAt ? new Date(series.updatedAt as string) : new Date(),
    } as unknown as IContent;
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return null;
  }
}

async function getSimilarSeries(language: string, excludeId: string) {
  try {
    await dbConnect();
    const series = await Content.find({ 
      type: "series", 
      language: language,
      _id: { $ne: excludeId }
    })
    .limit(10)
    .lean() as unknown as Record<string, unknown>[];
    
    return series.map(s => ({
      _id: String(s._id || ""),
      title: String(s.title || ""),
      poster: String(s.poster || ""),
      banner: s.banner ? String(s.banner) : "",
      description: s.description ? String(s.description) : "",
      year: s.year ? String(s.year) : "",
      rating: s.rating != undefined ? Number(s.rating) : undefined,
      quality: s.quality ? String(s.quality) : "",
      language: s.language ? String(s.language) : "",
      audioLanguages: Array.isArray(s.audioLanguages) ? s.audioLanguages.map(String) : [],
      type: String(s.type || "series"),
      tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
      seasons: Array.isArray(s.seasons) ? s.seasons : [],
      category: s.category ? String(s.category) : "",
      tmdbId: s.tmdbId != undefined ? Number(s.tmdbId) : undefined,
      tmdbGenreIds: Array.isArray(s.tmdbGenreIds) ? s.tmdbGenreIds.map(Number) : undefined,
      tmdbGenres: Array.isArray(s.tmdbGenres) ? s.tmdbGenres.map(String) : undefined,
      createdAt: s.createdAt ? new Date(s.createdAt as string) : new Date(),
      updatedAt: s.updatedAt ? new Date(s.updatedAt as string) : new Date(),
    })) as unknown as IContent[];
  } catch (error) {
    console.error("Failed to fetch similar series:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seriesId = resolveSeriesIdFromSlug(slug);
  const series = await getSeries(seriesId);
  
  if (!series) {
    return {
      title: "Series Not Found",
    };
  }
  
  const title = `${series.title} ${series.year ? `(${series.year})` : ""} - Watch Online`;
  const description = series.description || `Watch ${series.title} online in HD quality. ${series.language} web series.`;
  const imageUrl = series.poster || series.banner || SITE_CONFIG.ogImage;
  const url = `${SITE_CONFIG.url}/series/${slug}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: series.title,
        },
      ],
      type: "video.tv_show",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function SeriesDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seriesId = resolveSeriesIdFromSlug(slug);
  const series = await getSeries(seriesId);
  
  if (!series) {
    notFound();
  }
  
  const similarSeries = await getSimilarSeries(series.language || "Telugu", seriesId);
  
  return <SeriesDetailsClient series={series} similarSeries={similarSeries} />;
}
