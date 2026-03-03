import { Metadata } from "next";
import MoviesClient from "./MoviesClient";
import { SITE_CONFIG } from "@/utils/constants";

export const metadata: Metadata = {
  title: `Watch Movies Online - ${SITE_CONFIG.name}`,
  description: `Watch latest movies online in HD quality. ${SITE_CONFIG.description}`,
};

export default function MoviesPage() {
  return <MoviesClient />;
}
