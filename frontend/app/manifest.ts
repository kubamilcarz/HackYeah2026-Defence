import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PLAN:0",
    short_name: "PLAN:0",
    description: "Household crisis-readiness planning.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f6",
    theme_color: "#b00020",
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
