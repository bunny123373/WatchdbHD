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
      url: `${baseUrl}/admin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    await dbConnect();
    const items = await Content.find({}, { _id: 1, type: 1, updatedAt: 1 }).lean() as Array<{
      _id: unknown;
      type?: string;
      updatedAt?: Date | string;
    }>;

    const contentRoutes: MetadataRoute.Sitemap = items.map((item) => {
      const path = item.type === "movie" ? "movie" : "series";
      const id = String(item._id || "");
      const updated = item.updatedAt ? new Date(item.updatedAt) : new Date();

      return {
        url: `${baseUrl}/${path}/${id}`,
        lastModified: updated,
        changeFrequency: "weekly",
        priority: 0.8,
      };
    });

    return [...staticRoutes, ...contentRoutes];
  } catch (error) {
    console.log("Sitemap: Could not load dynamic content from DB, using static routes only");
  }

  return staticRoutes;
}
