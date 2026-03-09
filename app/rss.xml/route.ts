import { getPostsOrNull } from "@/lib/notion/safe";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dhjeong.kr";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPostsOrNull();
  const sortedPosts = [...(posts ?? [])].sort(
    (a, b) => new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
  );

  const items = sortedPosts.map((post) => {
    const postUrl = `${BASE_URL}/articles/${post.slug}`;
    const publishDate = new Date(post.date || post.updateAt).toUTCString();
    const updatedDate = new Date(post.updateAt).toUTCString();

    return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${postUrl}</link>
        <guid isPermaLink="true">${postUrl}</guid>
        <pubDate>${publishDate}</pubDate>
        <description>${escapeXml(post.summary)}</description>
        <category>${escapeXml(post.category)}</category>
        <source url="${BASE_URL}/rss.xml">${escapeXml("N-Blog RSS Feed")}</source>
        <atom:updated>${updatedDate}</atom:updated>
      </item>`;
  });

  const latestDate = sortedPosts[0]?.updateAt;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>${escapeXml("N-Blog RSS Feed")}</title>
        <link>${BASE_URL}</link>
        <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
        <description>${escapeXml("N-Blog의 최신 아티클 RSS 피드")}</description>
        <language>ko-KR</language>
        ${latestDate ? `<lastBuildDate>${new Date(latestDate).toUTCString()}</lastBuildDate>` : ""}
        ${items.join("\n")}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=900, stale-while-revalidate=3600"
    }
  });
}
