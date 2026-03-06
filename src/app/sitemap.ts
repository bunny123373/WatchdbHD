import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/utils/constants";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/all-series`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/download`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/request`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  try {
    await dbConnect();
    const items = await Content.find({}, { _id: 1, slug: 1, type: 1, updatedAt: 1 }).lean() as Array<{
      _id: unknown;
      slug?: string;
      type?: string;
      updatedAt?: Date | string;
    }>;

    const contentRoutes: MetadataRoute.Sitemap = items.map((item) => {
      const path = item.type === "movie" ? "movie" : "series";
      const id = String(item._id || "");
      const slug = item.slug;
      const updated = item.updatedAt ? new Date(item.updatedAt) : new Date();

      const url = slug 
        ? `${baseUrl}/${path}/${slug}-${id}` 
        : `${baseUrl}/${path}/${id}`;

      return {
        url,
        lastModified: updated,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...contentRoutes];
  } catch (error) {
    console.log("Sitemap: Could not load dynamic content from DB, using static routes only");
  }

  return staticRoutes;
}
