import type { MetadataRoute } from "next";
import { getPostsOrNull } from "@/lib/notion/safe";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/overview", "/about", "/articles", "/collection"];
  const posts = await getPostsOrNull();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: "weekly",
    priority: path === "/overview" ? 1 : 0.8
  }));

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/articles/${post.slug}`,
    lastModified: post.updateAt,
    changeFrequency: "monthly",
    priority: 0.7
  }));

  return [...staticEntries, ...postEntries];
}
