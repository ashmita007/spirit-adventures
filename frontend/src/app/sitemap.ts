import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://spiritadventures.in";

  const staticRoutes = [
    "",
    "/trips",
    "/destinations",
    "/gallery",
    "/blog",
    "/about",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const tripRoutes = [
    "kedarkantha-trek",
    "hampta-pass-trek",
    "kashmir-great-lakes",
    "spiti-valley-expedition",
    "sandhan-valley-canyon",
    "gokarna-beach-trek",
  ].map((slug) => ({
    url: `${baseUrl}/trips/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const destinationRoutes = [
    "uttarakhand",
    "himachal",
    "kashmir",
    "ladakh",
    "maharashtra",
    "karnataka",
  ].map((slug) => ({
    url: `${baseUrl}/destinations/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...tripRoutes, ...destinationRoutes];
}
