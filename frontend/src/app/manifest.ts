import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spirit Adventures",
    short_name: "Spirit",
    description: "Treks, river rafting, beach trails and Himalayan expeditions.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#062B49",
    icons: [{ src: "/images/favicon.png", sizes: "100x100", type: "image/png" }],
  };
}
