import type { Metadata } from "next";
import GalleryManager from "./gallery-manager";

export const metadata: Metadata = {
  title: "Photo Gallery | Spirit Adventures Owner HQ",
  robots: { index: false, follow: false },
};

export default function OwnerGalleryPage() {
  return <GalleryManager />;
}
