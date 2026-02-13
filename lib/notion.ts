import { Client } from "@notionhq/client";
import { CategorySummary, PostSummary } from "./types";

const notionToken = process.env.NOTION_API_KEY;
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notion = notionToken ? new Client({ auth: notionToken }) : null;
const NOTION_TIMEOUT_MS = 5000;

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
      setTimeout(() => reject(new Error("NOTION_TIMEOUT")), NOTION_TIMEOUT_MS);
    })
  ]);
}

export async function getPosts(): Promise<PostSummary[]> {
  if (!notion || !notionDatabaseId) {
    throw new Error("NOTION_CONFIG_MISSING");
  }

  const notionClient = notion;
  const databaseId = notionDatabaseId;

  try {
    const response = await withTimeout(
      notionClient.databases.query({
        database_id: databaseId,
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
      const content = extractText(result.properties.Content) || summary;

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
        readingMinutes: Math.max(3, Math.ceil(content.length / 220)),
        coverImage: extractCover(result),
        content
      });

      return acc;
    }, []);
  } catch {
    throw new Error("NOTION_FETCH_FAILED");
  }
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
