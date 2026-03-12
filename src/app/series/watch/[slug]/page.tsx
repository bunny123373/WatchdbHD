import Link from "next/link";
import SeriesWatchClient from "./SeriesWatchClient";
import { getContentById, resolveContentIdFromSlug } from "@/lib/content-queries";

interface SeriesWatchPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ season?: string; episode?: string }>;
}

export default async function SeriesWatchPage({ params, searchParams }: SeriesWatchPageProps) {
  const { slug } = await params;
  const { season, episode } = await searchParams;
  const seriesId = resolveContentIdFromSlug(slug);
  const series = await getContentById(seriesId);

  if (!series || series.type !== "series") {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-white">Series not found</h1>
          <Link href="/" className="mt-4 inline-block text-yellow-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SeriesWatchClient
      series={series}
      initialSeason={season ? Number.parseInt(season, 10) : undefined}
      initialEpisode={episode ? Number.parseInt(episode, 10) : undefined}
    />
  );
}
