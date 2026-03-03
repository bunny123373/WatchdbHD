import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/dbconnect";
import Collection from "@/models/Collection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";
import { SITE_CONFIG } from "@/utils/constants";

export const metadata: Metadata = {
  title: `Collections - ${SITE_CONFIG.name}`,
  description: `Browse movie collections on ${SITE_CONFIG.name}`,
};

async function getCollections() {
  try {
    await dbConnect();
    const collections = await Collection.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("contentIds", "title poster type year rating")
      .lean();
    return collections;
  } catch (error) {
    console.error("Failed to fetch collections:", error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Collections</h1>
          
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No collections yet</p>
            </div>
          ) : (
            <div className="space-y-8">
              {collections.map((collection: unknown) => {
                const coll = collection as { _id: string; name: string; description?: string; contentIds: { _id: string; title: string; poster: string; type: string; year?: string; rating?: number }[] };
                return (
                  <div key={coll._id}>
                    <h2 className="text-xl font-bold text-white mb-3">{coll.name}</h2>
                    {coll.description && <p className="text-gray-400 text-sm mb-3">{coll.description}</p>}
                    <ContentGrid title="" items={coll.contentIds as never} isNetflixStyle />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
