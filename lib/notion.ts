import { NotionAPI } from "notion-client";
import { CategorySummary, PostSummary } from "./types";

const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notion = new NotionAPI();

function normalizePageId(raw: string): string {
  const trimmed = raw.trim();
  const idFromUrl = trimmed.match(/[a-f0-9]{32}/i)?.[0];
  const compact = (idFromUrl ?? trimmed).replace(/-/g, "");

  if (!/^[a-f0-9]{32}$/i.test(compact)) {
    throw new Error("NOTION_DATABASE_ID_INVALID_FORMAT");
  }

  return compact;
}

function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toPlainText(value: unknown): string {
  if (!Array.isArray(value)) return "";

  return value
    .map((entry) => {
      if (!Array.isArray(entry) || entry.length === 0) return "";
      const text = entry[0];
      return typeof text === "string" ? text : "";
    })
    .join(" ")
    .trim();
}

function extractPropertyText(pageValue: Record<string, unknown>, propertyId: string | undefined): string {
  if (!propertyId) return "";
  const props = pageValue.properties as Record<string, unknown> | undefined;
  if (!props) return "";
  return toPlainText(props[propertyId]);
}

function extractTags(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function resolveSchemaPropertyId(
  schema: Record<string, { name?: string; type?: string }> | undefined,
  candidates: string[]
): string | undefined {
  if (!schema) return undefined;

  const lowered = candidates.map((candidate) => candidate.toLowerCase());

  for (const [key, value] of Object.entries(schema)) {
    const name = (value.name ?? "").toLowerCase();
    if (lowered.includes(name)) return key;
  }

  return undefined;
}

function readBlockTitle(block: Record<string, unknown> | undefined): string {
  if (!block) return "";
  const props = block.properties as Record<string, unknown> | undefined;
  return toPlainText(props?.title);
}

function extractContentFromChildren(
  rowValue: Record<string, unknown>,
  blockMap: Record<string, { value?: Record<string, unknown> }>
): string {
  const childIds = Array.isArray(rowValue.content) ? (rowValue.content as string[]) : [];

  const lines = childIds
    .map((id) => readBlockTitle(blockMap[id]?.value))
    .filter(Boolean);

  return lines.join("\n\n");
}

async function getDatabaseRecordMap() {
  if (!notionDatabaseId) {
    throw new Error("NOTION_CONFIG_MISSING");
  }

  const pageId = normalizePageId(notionDatabaseId);
  return notion.getPage(pageId);
}

export async function getPosts(): Promise<PostSummary[]> {
  const recordMap = await getDatabaseRecordMap();

  const blockMap = (recordMap.block ?? {}) as Record<string, { value?: Record<string, unknown> }>;
  const collectionMap = (recordMap.collection ?? {}) as Record<string, { value?: Record<string, unknown> }>;

  const databasePage = Object.values(blockMap).find((entry) => {
    const value = entry.value;
    return value?.type === "collection_view_page" || value?.type === "collection_view";
  })?.value;

  if (!databasePage) {
    throw new Error("NOTION_DATABASE_PAGE_NOT_FOUND");
  }

  const collectionId = databasePage.collection_id as string | undefined;
  if (!collectionId) {
    throw new Error("NOTION_COLLECTION_ID_NOT_FOUND");
  }

  const collection = collectionMap[collectionId]?.value;
  const schema = (collection?.schema ?? {}) as Record<string, { name?: string; type?: string }>;

  const titleId = resolveSchemaPropertyId(schema, ["title", "name"]);
  const slugId = resolveSchemaPropertyId(schema, ["slug", "url"]);
  const summaryId = resolveSchemaPropertyId(schema, ["summary", "description", "excerpt"]);
  const categoryId = resolveSchemaPropertyId(schema, ["category"]);
  const tagsId = resolveSchemaPropertyId(schema, ["tags", "tag"]);
  const updatedId = resolveSchemaPropertyId(schema, ["updated", "date", "published", "publish date"]);
  const contentId = resolveSchemaPropertyId(schema, ["content", "body"]);

  const rows = Object.values(blockMap)
    .map((entry) => entry.value)
    .filter((value): value is Record<string, unknown> => Boolean(value))
    .filter((value) => value.type === "page" && value.parent_id === collectionId);

  const posts = rows
    .map((rowValue) => {
      const id = (rowValue.id as string | undefined) ?? "";
      const title = extractPropertyText(rowValue, titleId) || "Untitled";
      const slug = extractPropertyText(rowValue, slugId) || id;
      const summary = extractPropertyText(rowValue, summaryId);
      const category = extractPropertyText(rowValue, categoryId) || "Uncategorized";
      const tags = extractTags(extractPropertyText(rowValue, tagsId));
      const updatedAt = extractPropertyText(rowValue, updatedId) || new Date().toISOString().split("T")[0];
      const blockContent = extractContentFromChildren(rowValue, blockMap);
      const propertyContent = extractPropertyText(rowValue, contentId);
      const content = propertyContent || blockContent || summary;

      const format = (rowValue.format ?? {}) as Record<string, unknown>;
      const coverImage =
        typeof format.page_cover === "string"
          ? (format.page_cover as string)
          : typeof format.display_source === "string"
            ? (format.display_source as string)
            : undefined;

      return {
        id,
        title,
        slug,
        summary,
        category,
        tags,
        updatedAt,
        readingMinutes: Math.max(3, Math.ceil(content.length / 220)),
        coverImage,
        content
      } satisfies PostSummary;
    })
    .filter((post) => Boolean(post.id));

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
