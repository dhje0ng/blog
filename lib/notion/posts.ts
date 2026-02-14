import { NotionAPI } from "notion-client";
import { CategorySummary, PostSummary } from "@/lib/models/post";

type NotionBlockValue = Record<string, unknown>;
type NotionBlockMap = Record<string, { value?: NotionBlockValue }>;
type NotionCollectionSchema = Record<string, { name?: string; type?: string }>;

const notion = new NotionAPI();
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

const NOTION_DATA_UNAVAILABLE_ERRORS = new Set([
  "NOTION_CONFIG_MISSING",
  "NOTION_DATABASE_ID_INVALID_FORMAT",
  "NOTION_DATABASE_PAGE_NOT_FOUND",
  "NOTION_DATABASE_UNREADABLE",
  "NOTION_COLLECTION_NOT_FOUND"
]);

export function isNotionDatabaseUnavailableError(error: unknown): boolean {
  return error instanceof Error && NOTION_DATA_UNAVAILABLE_ERRORS.has(error.message);
}

function normalizePageId(raw: string): string {
  const idFromUrl = raw.trim().match(/[a-f0-9]{32}/i)?.[0];
  const compact = (idFromUrl ?? raw.trim()).replace(/-/g, "");

  if (!/^[a-f0-9]{32}$/i.test(compact)) {
    throw new Error("NOTION_DATABASE_ID_INVALID_FORMAT");
  }

  return compact;
}

function plainText(value: unknown): string {
  if (!Array.isArray(value)) return "";

  return value
    .map((entry) => (Array.isArray(entry) && typeof entry[0] === "string" ? entry[0] : ""))
    .join(" ")
    .trim();
}

function resolvePropertyId(schema: NotionCollectionSchema, names: string[]): string | undefined {
  const nameSet = new Set(names.map((name) => name.toLowerCase()));

  for (const [propertyId, property] of Object.entries(schema)) {
    const propertyName = (property.name ?? "").toLowerCase();
    if (nameSet.has(propertyName)) {
      return propertyId;
    }
  }

  return undefined;
}

function readProperty(row: NotionBlockValue, propertyId?: string): string {
  if (!propertyId) return "";
  const properties = row.properties as Record<string, unknown> | undefined;
  return plainText(properties?.[propertyId]);
}

function normalizeStatus(status: string): "public" | "private" {
  return status.trim().toLowerCase() === "private" ? "private" : "public";
}

function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function extractBodyFromChildren(row: NotionBlockValue, blockMap: NotionBlockMap): string {
  const contentIds = Array.isArray(row.content) ? (row.content as string[]) : [];

  return contentIds
    .map((blockId) => {
      const properties = blockMap[blockId]?.value?.properties as Record<string, unknown> | undefined;
      return plainText(properties?.title);
    })
    .filter(Boolean)
    .join("\n\n");
}

async function loadDatabaseRecordMap() {
  if (!NOTION_DATABASE_ID) {
    throw new Error("NOTION_CONFIG_MISSING");
  }

  const databasePageId = normalizePageId(NOTION_DATABASE_ID);

  try {
    return await notion.getPage(databasePageId);
  } catch {
    throw new Error("NOTION_DATABASE_UNREADABLE");
  }
}

export async function getPosts(): Promise<PostSummary[]> {
  const recordMap = await loadDatabaseRecordMap();
  const blockMap = (recordMap.block ?? {}) as NotionBlockMap;
  const collectionMap = (recordMap.collection ?? {}) as Record<string, { value?: Record<string, unknown> }>;

  const databaseBlock = Object.values(blockMap)
    .map((entry) => entry.value)
    .find((value) => value?.type === "collection_view_page" || value?.type === "collection_view");

  if (!databaseBlock) {
    throw new Error("NOTION_DATABASE_PAGE_NOT_FOUND");
  }

  const collectionId = databaseBlock.collection_id as string | undefined;
  if (!collectionId) {
    throw new Error("NOTION_COLLECTION_NOT_FOUND");
  }

  const schema = (collectionMap[collectionId]?.value?.schema ?? {}) as NotionCollectionSchema;

  const property = {
    title: resolvePropertyId(schema, ["title", "name"]),
    slug: resolvePropertyId(schema, ["slug", "url"]),
    author: resolvePropertyId(schema, ["author", "writer"]),
    status: resolvePropertyId(schema, ["status", "visibility"]),
    date: resolvePropertyId(schema, ["date", "publish date", "published"]),
    updateAt: resolvePropertyId(schema, ["updateat", "updated at", "updated"]),
    summary: resolvePropertyId(schema, ["summary", "description", "excerpt"]),
    category: resolvePropertyId(schema, ["category"]),
    tags: resolvePropertyId(schema, ["tags", "tag"]),
    thumbnail: resolvePropertyId(schema, ["thumbnail", "thumb", "cover"]),
    content: resolvePropertyId(schema, ["content", "body"])
  };

  const rows = Object.values(blockMap)
    .map((entry) => entry.value)
    .filter((value): value is NotionBlockValue => Boolean(value))
    .filter((value) => value.type === "page" && value.parent_id === collectionId);

  return rows
    .map((row) => {
      const id = (row.id as string | undefined) ?? "";
      const title = readProperty(row, property.title) || "Untitled";
      const slug = readProperty(row, property.slug) || id;
      const author = readProperty(row, property.author) || "Unknown";
      const status = normalizeStatus(readProperty(row, property.status));
      const date = readProperty(row, property.date) || new Date().toISOString().split("T")[0];
      const updateAt = readProperty(row, property.updateAt) || date;
      const summary = readProperty(row, property.summary);
      const category = readProperty(row, property.category) || "Uncategorized";
      const tags = parseTags(readProperty(row, property.tags));
      const bodyFromProperty = readProperty(row, property.content);
      const bodyFromChildren = extractBodyFromChildren(row, blockMap);
      const content = bodyFromProperty || bodyFromChildren || summary;

      const format = (row.format ?? {}) as Record<string, unknown>;
      const thumbnail =
        readProperty(row, property.thumbnail) ||
        (typeof format.page_cover === "string"
          ? format.page_cover
          : typeof format.display_source === "string"
            ? format.display_source
            : undefined);

      return {
        id,
        title,
        slug,
        author,
        status,
        date,
        updateAt,
        summary,
        tags,
        category,
        readingMinutes: Math.max(3, Math.ceil(content.length / 220)),
        thumbnail,
        content
      } satisfies PostSummary;
    })
    .filter((post) => Boolean(post.id) && post.status === "public")
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getPostBySlug(slug: string): Promise<PostSummary | null> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  const posts = await getPosts();
  const counters = posts.reduce<Map<string, number>>((acc, post) => {
    acc.set(post.category, (acc.get(post.category) ?? 0) + 1);
    return acc;
  }, new Map());

  return [...counters.entries()]
    .map(([name, count]) => ({
      name,
      slug: slugifyCategory(name),
      count,
      description: `${name} 주제의 아티클 ${count}개`
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getCategorySlug(name: string): string {
  return slugifyCategory(name);
}
