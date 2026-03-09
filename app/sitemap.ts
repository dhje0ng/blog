import type { MetadataRoute } from "next";
import { getPostsOrNull } from "@/lib/notion/safe";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhjeong.kr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/overview", "/articles", "/collection", "/rss.xml"];
  const now = new Date();
  const posts = await getPostsOrNull();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/rss.xml" ? "daily" : "weekly",
    priority: path === "/" || path === "/overview" ? 1 : 0.8
  }));

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/articles/${post.slug}`,
    lastModified: new Date(post.updateAt),
    changeFrequency: "monthly",
    priority: 0.7
  }));

  return [...staticEntries, ...postEntries];
}
