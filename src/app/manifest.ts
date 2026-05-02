import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "next-app-studytracker",
    short_name: "studytracker",
    description: "next-app-studytracker application",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
