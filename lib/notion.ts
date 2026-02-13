import { Client } from "@notionhq/client";
import { CategorySummary, PostSummary } from "./types";

const notionToken = process.env.NOTION_API_KEY;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notion = notionToken ? new Client({ auth: notionToken }) : null;
const NOTION_TIMEOUT_MS = 5000;

const FALLBACK_POSTS: PostSummary[] = [
  {
    id: "seed-1",
    title: "Next.js + Notion 블로그 아키텍처 설계",
    slug: "nextjs-notion-architecture",
    summary: "데이터 흐름, 렌더링 전략, 배포 전략을 포함한 1차 아키텍처 프로토타입 설명",
    tags: ["Architecture", "Next.js", "Notion"],
    category: "Engineering",
    updatedAt: "2026-02-13",
    readingMinutes: 8,
    coverImage: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "seed-2",
    title: "GitHub 디자인 시스템 기반 UI 토큰 정의",
    slug: "github-inspired-ui-tokens",
    summary: "화이트톤 중심의 간격, 타이포, 경계선, 카드 규칙을 정의한 디자인 기초",
    tags: ["Design System", "UI"],
    category: "Design",
    updatedAt: "2026-02-12",
    readingMinutes: 6,
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "seed-3",
    title: "반응형 목록형 블로그 레이아웃 프로토타입",
    slug: "responsive-blog-layout-prototype",
    summary: "모바일/태블릿/데스크톱에 맞춘 컬럼 전환과 콘텐츠 우선순위 조정 방식",
    tags: ["Responsive", "Prototype"],
    category: "Frontend",
    updatedAt: "2026-02-11",
    readingMinutes: 5,
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "seed-4",
    title: "글쓰기 중심 블로그 UI를 위한 정보 구조 설계",
    slug: "editorial-information-architecture",
    summary: "Overview, Collection, Articles로 분리한 내비게이션 구조와 페이지 책임 정의",
    tags: ["IA", "Blog"],
    category: "Product",
    updatedAt: "2026-02-10",
    readingMinutes: 7
  }
];

function extractText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const typed = value as {
    title?: Array<{ plain_text?: string }>;
    rich_text?: Array<{ plain_text?: string }>;
  };
  const target = typed.title ?? typed.rich_text;
  return target?.map((item) => item.plain_text ?? "").join("") ?? "";
}

function extractCategory(value: unknown): string {
  if (!value || typeof value !== "object") return "Uncategorized";
  const typed = value as { select?: { name?: string } | null };
  return typed.select?.name ?? "Uncategorized";
}

export async function getPosts(): Promise<PostSummary[]> {
  if (!notion || !notionDatabaseId) return FALLBACK_POSTS;

  try {
    const response = await Promise.race([
      notion.databases.query({
        database_id: notionDatabaseId,
        sorts: [{ property: "Updated", direction: "descending" }],
        page_size: 100
      }),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Notion request timeout")), NOTION_TIMEOUT_MS);
      })
    ]);

    return response.results
      .map((result) => {
        if (!("properties" in result)) return null;

        const title = extractText(result.properties.Title);
        const slug = extractText(result.properties.Slug) || result.id;
        const summary = extractText(result.properties.Summary);
        const category = extractCategory(result.properties.Category);

        const tags =
          "multi_select" in (result.properties.Tags ?? {})
            ? (result.properties.Tags as { multi_select: Array<{ name: string }> }).multi_select.map((tag) => tag.name)
            : [];

        const updatedAt =
          "date" in (result.properties.Updated ?? {})
            ? (result.properties.Updated as { date: { start: string } | null }).date?.start ?? ""
            : "";

        return {
          id: result.id,
          title: title || "Untitled",
          slug,
          summary,
          category,
          tags,
          updatedAt: updatedAt || new Date().toISOString().split("T")[0],
          readingMinutes: Math.max(3, Math.ceil(summary.length / 90))
        } satisfies PostSummary;
      })
      .filter((post): post is PostSummary => Boolean(post));
  } catch {
    return FALLBACK_POSTS;
  }
}

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const posts = await getPosts();
  const categoryMap = posts.reduce<Map<string, number>>((acc, post) => {
    const category = post.category ?? "Uncategorized";
    acc.set(category, (acc.get(category) ?? 0) + 1);
    return acc;
  }, new Map());

  return [...categoryMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
      description: `${name} 주제의 아티클 ${count}개`
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
