import { Client } from "@notionhq/client";
import { PostSummary } from "./types";

const notionToken = process.env.NOTION_API_KEY;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;

const notion = notionToken ? new Client({ auth: notionToken }) : null;

const FALLBACK_POSTS: PostSummary[] = [
  {
    id: "seed-1",
    title: "Next.js + Notion 블로그 아키텍처 설계",
    slug: "nextjs-notion-architecture",
    summary: "데이터 흐름, 렌더링 전략, 배포 전략을 포함한 1차 아키텍처 프로토타입 설명",
    tags: ["Architecture", "Next.js", "Notion"],
    updatedAt: "2026-02-13",
    readingMinutes: 8
  },
  {
    id: "seed-2",
    title: "GitHub 디자인 시스템 기반 UI 토큰 정의",
    slug: "github-inspired-ui-tokens",
    summary: "화이트톤 중심의 간격, 타이포, 경계선, 카드 규칙을 정의한 디자인 기초",
    tags: ["Design System", "UI"],
    updatedAt: "2026-02-12",
    readingMinutes: 6
  },
  {
    id: "seed-3",
    title: "반응형 목록형 블로그 레이아웃 프로토타입",
    slug: "responsive-blog-layout-prototype",
    summary: "모바일/태블릿/데스크톱에 맞춘 컬럼 전환과 콘텐츠 우선순위 조정 방식",
    tags: ["Responsive", "Prototype"],
    updatedAt: "2026-02-11",
    readingMinutes: 5
  }
];

function extractText(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const typed = value as { title?: Array<{ plain_text?: string }>; rich_text?: Array<{ plain_text?: string }>; };
  const target = typed.title ?? typed.rich_text;
  return target?.map((v) => v.plain_text ?? "").join("") ?? "";
}

export async function getPosts(): Promise<PostSummary[]> {
  if (!notion || !notionDatabaseId) {
    return FALLBACK_POSTS;
  }

  try {
    const response = await notion.databases.query({
      database_id: notionDatabaseId,
      sorts: [{ property: "Updated", direction: "descending" }]
    });

    return response.results
      .map((result) => {
        if (!("properties" in result)) {
          return null;
        }

        const title = extractText(result.properties.Title);
        const slug = extractText(result.properties.Slug) || result.id;
        const summary = extractText(result.properties.Summary);
        const tags =
          "multi_select" in (result.properties.Tags ?? {})
            ? (result.properties.Tags as { multi_select: Array<{ name: string }> }).multi_select.map((t) => t.name)
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
          tags,
          updatedAt: updatedAt || new Date().toISOString().split("T")[0],
          readingMinutes: Math.max(3, Math.ceil(summary.length / 80))
        } satisfies PostSummary;
      })
      .filter((post): post is PostSummary => Boolean(post));
  } catch {
    return FALLBACK_POSTS;
  }
}
