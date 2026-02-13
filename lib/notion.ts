import { CategorySummary, PostSummary } from "./types";

const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const NOTION_TIMEOUT_MS = 5000;
const NOTION_VERSION = "2022-06-28";

type NotionQueryResponse = {
  results?: Array<{
    id: string;
    cover?: unknown;
    properties?: Record<string, unknown>;
  }>;
};

function normalizeDatabaseId(raw: string): string {
  const trimmed = raw.trim();
  const idFromUrl = trimmed.match(/[a-f0-9]{32}/i)?.[0];
  const compact = (idFromUrl ?? trimmed).replace(/-/g, "");

  if (!/^[a-f0-9]{32}$/i.test(compact)) {
    throw new Error("NOTION_DATABASE_ID_INVALID_FORMAT");
  }

  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

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


function extractTags(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  if (!("multi_select" in value)) return [];
  const typed = value as { multi_select?: Array<{ name?: string }> };
  return (typed.multi_select ?? []).map((tag) => tag.name ?? "").filter(Boolean);
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
      setTimeout(() => reject(new Error("NOTION_TIMEOUT")), NOTION_TIMEOUT_MS);
    })
  ]);
}

function parseUpdated(properties: Record<string, unknown> | undefined): string {
  const updatedProp = properties?.Updated;
  if (updatedProp && typeof updatedProp === "object" && "date" in updatedProp) {
    const date = (updatedProp as { date: { start?: string } | null }).date?.start;
    if (date) return date;
  }
  return new Date().toISOString().split("T")[0];
}

async function queryPublicDatabase(databaseId: string): Promise<NotionQueryResponse> {
  const response = await withTimeout(
    fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
      },
      body: JSON.stringify({ page_size: 100 }),
      cache: "no-store"
    })
  );

  if (!response.ok) {
    throw new Error("NOTION_FETCH_FAILED");
  }

  return (await response.json()) as NotionQueryResponse;
}

export async function getPosts(): Promise<PostSummary[]> {
  if (!notionDatabaseId) {
    throw new Error("NOTION_CONFIG_MISSING");
  }

  const databaseId = normalizeDatabaseId(notionDatabaseId);
  const payload = await queryPublicDatabase(databaseId);

  const posts = (payload.results ?? []).reduce<PostSummary[]>((acc, result) => {
    const props = result.properties;
    if (!props) return acc;

    const title = extractText(props.Title);
    const slug = extractText(props.Slug) || result.id;
    const summary = extractText(props.Summary);
    const category = extractCategory(props.Category);
    const content = extractText(props.Content) || summary;

    const tags = extractTags(props.Tags);

    acc.push({
      id: result.id,
      title: title || "Untitled",
      slug,
      summary,
      category,
      tags,
      updatedAt: parseUpdated(props),
      readingMinutes: Math.max(3, Math.ceil(content.length / 220)),
      coverImage: extractCover(result),
      content
    });

    return acc;
  }, []);

  return posts.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export async function getPostBySlug(slug: string): Promise<PostSummary | null> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const posts = await getPosts();
  const categoryMap = posts.reduce<Map<string, number>>((acc, post) => {
    acc.set(post.category, (acc.get(post.category) ?? 0) + 1);
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

export function getCategorySlug(name: string): string {
  return slugifyCategory(name);
}
