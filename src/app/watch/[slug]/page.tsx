import Link from "next/link";
import WatchMovieClient from "./WatchMovieClient";
import { getContentById, resolveContentIdFromSlug } from "@/lib/content-queries";

export default async function WatchMoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movieId = resolveContentIdFromSlug(slug);
  const movie = await getContentById(movieId);

  if (!movie || movie.type !== "movie") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">Movie not found</h1>
          <Link href="/" className="text-red-600 hover:text-red-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return <WatchMovieClient movie={movie} />;
}
