import { IContent } from "@/models/Content";
import HomeClient from "./HomeClient";

async function getContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/content`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const content: IContent[] = await getContent();

  return <HomeClient initialContent={content} />;
}
