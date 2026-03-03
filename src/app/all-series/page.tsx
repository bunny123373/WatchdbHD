import { Metadata } from "next";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { SITE_CONFIG } from "@/utils/constants";

export const metadata: Metadata = {
  title: `Watch TV Series Online - ${SITE_CONFIG.name}`,
  description: `Watch latest TV series online in HD quality. ${SITE_CONFIG.description}`,
};

async function getSeries() {
  try {
    await dbConnect();
    const series = await Content.find({ type: "series" })
      .sort({ createdAt: -1 })
      .lean() as unknown as Record<string, unknown>[];

    return series.map((s) => ({
      _id: String(s._id || ""),
      title: String(s.title || ""),
      poster: String(s.poster || ""),
      banner: s.banner ? String(s.banner) : "",
      description: s.description ? String(s.description) : "",
      year: s.year ? String(s.year) : "",
      rating: s.rating != undefined ? Number(s.rating) : undefined,
      quality: s.quality ? String(s.quality) : "",
      language: s.language ? String(s.language) : "",
      type: String(s.type || "series"),
      tags: Array.isArray(s.tags) ? s.tags.map(String) : [],
      seasons: Array.isArray(s.seasons) ? s.seasons : [],
      category: s.category ? String(s.category) : "",
      createdAt: s.createdAt ? new Date(s.createdAt as string) : new Date(),
    })) as unknown as IContent[];
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return [];
  }
}

export default async function SeriesAllPage() {
  const series = await getSeries();

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">TV Shows</h1>
          <ContentGrid title="" items={series} isNetflixStyle />
        </div>
      </div>
      <Footer />
    </div>
  );
}
