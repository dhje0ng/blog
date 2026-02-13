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
    coverImage: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80",
    content:
      "초기 설계 단계에서는 데이터 주도 구조를 먼저 만드는 것이 중요합니다. Notion 데이터베이스를 단일 콘텐츠 소스로 사용하면 작성 경험과 운영 효율을 동시에 확보할 수 있습니다.\n\n앱 레벨에서는 목록, 상세, 카테고리 집계를 각각 독립된 레이어로 분리해 두면 이후 검색, 추천, 태그 필터 같은 기능을 쉽게 확장할 수 있습니다.\n\n렌더링 전략은 정적 생성 + 재검증을 기본으로 두고, 외부 API 실패 시 fallback 콘텐츠로 자연스럽게 전환하는 것을 권장합니다."
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
    coverImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    content:
      "디자인 토큰은 화면 전체의 일관성을 보장하는 계약입니다. 색상, 간격, 반경, 타이포 스케일을 먼저 정의하면 컴포넌트 개발 속도와 품질이 함께 올라갑니다.\n\n특히 블로그는 긴 글을 읽는 환경이기 때문에 타이포 대비와 문단 간격이 매우 중요합니다. 본문 줄 간격과 최대 너비를 먼저 조정한 뒤 카드나 네비게이션 스타일을 맞추는 순서를 추천합니다."
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
    coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    content:
      "모바일에서는 최신 글 리스트를 우선 노출하고, 데스크톱에서는 대표 글과 큐레이션 섹션을 함께 배치하는 방식이 읽기 동선을 안정화합니다.\n\n레이아웃 변화는 화면 폭만 기준으로 하지 말고 콘텐츠 맥락을 기준으로 설계해야 합니다. 예를 들어 메타데이터는 작은 화면에서 요약 형태로 줄이고, 제목/요약 텍스트는 line clamp로 밀도를 유지할 수 있습니다."
  },
  {
    id: "seed-4",
    title: "글쓰기 중심 블로그 UI를 위한 정보 구조 설계",
    slug: "editorial-information-architecture",
    summary: "Overview, Collection, Articles로 분리한 내비게이션 구조와 페이지 책임 정의",
    tags: ["IA", "Blog"],
    category: "Product",
    updatedAt: "2026-02-10",
    readingMinutes: 7,
    content:
      "정보 구조는 사용자 행동 시나리오에서 출발해야 합니다. 처음 방문한 사용자는 대표 콘텐츠를 빠르게 훑고, 반복 방문자는 최신 글이나 특정 주제를 찾습니다.\n\nOverview/Collection/Articles 분리는 이 흐름을 자연스럽게 분담합니다. 각 페이지의 목적이 명확하면 시각 디자인도 단순해지고, 컴포넌트 재사용 범위도 넓어집니다."
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

function extractCover(source: unknown): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const cover = (source as { cover?: unknown }).cover as
    | { type?: "external" | "file"; external?: { url?: string }; file?: { url?: string } }
    | undefined;
  if (!cover) return undefined;
  if (cover.type === "external") return cover.external?.url;
  if (cover.type === "file") return cover.file?.url;
  return undefined;
}


function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Notion request timeout")), NOTION_TIMEOUT_MS);
    })
  ]);
}

export async function getPosts(): Promise<PostSummary[]> {
  if (!notion || !notionDatabaseId) return FALLBACK_POSTS;

  try {
    const response = await withTimeout(
      notion.databases.query({
        database_id: notionDatabaseId,
        sorts: [{ property: "Updated", direction: "descending" }],
        page_size: 100
      })
    );

    return response.results.reduce<PostSummary[]>((acc, result) => {
      if (!("properties" in result)) return acc;

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

      acc.push({
        id: result.id,
        title: title || "Untitled",
        slug,
        summary,
        category,
        tags,
        updatedAt: updatedAt || new Date().toISOString().split("T")[0],
        readingMinutes: Math.max(3, Math.ceil(summary.length / 90)),
        coverImage: extractCover(result),
        content: summary
      });

      return acc;
    }, []);

  } catch {
    return FALLBACK_POSTS;
  }
}

export async function getPostBySlug(slug: string): Promise<PostSummary | null> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
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
      slug: slugifyCategory(name),
      description: `${name} 주제의 아티클 ${count}개`
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
