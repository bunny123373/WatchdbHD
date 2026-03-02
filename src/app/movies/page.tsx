import { Metadata } from "next";
import { IContent } from "@/models/Content";
import dbConnect from "@/lib/dbconnect";
import Content from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { SITE_CONFIG } from "@/utils/constants";

export const metadata: Metadata = {
  title: `Watch Movies Online - ${SITE_CONFIG.name}`,
  description: `Watch latest movies online in HD quality. ${SITE_CONFIG.description}`,
};

async function getMovies() {
  try {
    await dbConnect();
    const movies = await Content.find({ type: "movie" })
      .sort({ createdAt: -1 })
      .lean() as unknown as Record<string, unknown>[];

    return movies.map((m) => ({
      _id: String(m._id || ""),
      title: String(m.title || ""),
      poster: String(m.poster || ""),
      banner: m.banner ? String(m.banner) : "",
      description: m.description ? String(m.description) : "",
      year: m.year ? String(m.year) : "",
      rating: m.rating != undefined ? Number(m.rating) : undefined,
      quality: m.quality ? String(m.quality) : "",
      language: m.language ? String(m.language) : "",
      type: String(m.type || "movie"),
      tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
      category: m.category ? String(m.category) : "",
      createdAt: m.createdAt ? new Date(m.createdAt as string) : new Date(),
    })) as unknown as IContent[];
  } catch (error) {
    console.error("Failed to fetch movies:", error);
    return [];
  }
}

export default async function MoviesPage() {
  const movies = await getMovies();

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Movies</h1>
          <ContentGrid title="" items={movies} isNetflixStyle />
        </div>
      </div>
      <Footer />
    </main>
  );
}
