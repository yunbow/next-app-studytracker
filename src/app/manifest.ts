import type { MetadataRoute } from "next";
import { BRAND_ICON_192_SRC, BRAND_ICON_SRC } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "next-app-studytracker",
    short_name: "StudyTracker",
    description: "学習時間を記録・可視化して、目標達成をサポート",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f9f86",
    icons: [
      {
        src: BRAND_ICON_192_SRC,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: BRAND_ICON_SRC,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
