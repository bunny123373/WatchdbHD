import { Metadata } from "next";
import Link from "next/link";
import dbConnect from "@/lib/dbconnect";
import Collection from "@/models/Collection";
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
    <div className="min-h-screen bg-[#141414]">
      <div className="pt-20 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Collections</h1>
          
          {collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No collections yet</p>
            </div>
          ) : (
            <div className="space-y-8">
              {collections.map((collection: unknown) => {
                const coll = collection as { _id: string; name: string; description?: string; contentIds: { _id: string; title: string; poster: string; type: string; year?: string; rating?: number }[]; isTopTen?: boolean };
                return (
                  <div key={coll._id}>
                    <h2 className="text-xl font-bold text-white mb-3">{coll.name}</h2>
                    {coll.description && <p className="text-gray-400 text-sm mb-3">{coll.description}</p>}
                    {coll.isTopTen ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {coll.contentIds.slice(0, 10).map((item, idx) => (
                          <Link key={item._id} href={`/${item.type}/${item._id}`} className="group">
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1f1f1f]">
                              {item.poster ? (
                                <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <span className="text-4xl font-bold text-gray-600">{idx + 1}</span>
                                </div>
                              )}
                              <div className="absolute top-0 left-0 w-10 h-10 bg-yellow-500 flex items-center justify-center rounded-br-lg">
                                <span className="text-black font-bold text-xl">{idx + 1}</span>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent">
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                  <h3 className="text-white text-sm font-medium line-clamp-2">{item.title}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    {item.year && <span className="text-gray-400 text-xs">{item.year}</span>}
                                    {item.rating && (
                                      <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                                        <span className="text-gray-300 text-xs">{item.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <ContentGrid title="" items={coll.contentIds as never} isNetflixStyle />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
