import { isNotionClientError } from "@notionhq/client";
import {
  BlockObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  PartialDatabaseObjectResponse,
  RichTextItemResponse
} from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient } from "@/lib/notion/client";
import { CategorySummary, PostSummary } from "@/lib/models/post";
import siteConfig from "@/site.config";

const NOTION_DATABASE_ID = siteConfig.notion.notion_page_id;

const NOTION_DATA_UNAVAILABLE_ERRORS = new Set([
  "NOTION_CONFIG_MISSING",
  "NOTION_TOKEN_MISSING",
  "NOTION_PAGE_ID_INVALID_FORMAT",
  "NOTION_DATABASE_PAGE_NOT_FOUND",
  "NOTION_DATABASE_UNREADABLE"
]);

export function isNotionDatabaseUnavailableError(error: unknown): boolean {
  return error instanceof Error && NOTION_DATA_UNAVAILABLE_ERRORS.has(error.message);
}

function normalizePageId(raw: string): string {
  const idFromUrl = raw.trim().match(/[a-f0-9]{32}/i)?.[0];
  const compact = (idFromUrl ?? raw.trim()).replace(/-/g, "");

  if (!/^[a-f0-9]{32}$/i.test(compact)) {
    throw new Error("NOTION_PAGE_ID_INVALID_FORMAT");
  }

  return compact;
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

function richTextToPlainText(value: RichTextItemResponse[]): string {
  return value.map((item) => item.plain_text).join("").trim();
}

function isFullDatabase(result: DatabaseObjectResponse | PartialDatabaseObjectResponse): result is DatabaseObjectResponse {
  return "title" in result;
}

function isFullPage(result: PageObjectResponse | { object: "page" }): result is PageObjectResponse {
  return "properties" in result;
}

function getPropertyByName(page: PageObjectResponse, names: string[]) {
  const nameSet = new Set(names.map((name) => name.toLowerCase()));

  for (const [key, value] of Object.entries(page.properties)) {
    if (nameSet.has(key.toLowerCase())) {
      return value;
    }
  }

  return undefined;
}

function readTextProperty(page: PageObjectResponse, names: string[]): string {
  const property = getPropertyByName(page, names);
  if (!property) return "";

  if (property.type === "title") return richTextToPlainText(property.title);
  if (property.type === "rich_text") return richTextToPlainText(property.rich_text);
  if (property.type === "url") return property.url ?? "";
  if (property.type === "email") return property.email ?? "";
  if (property.type === "phone_number") return property.phone_number ?? "";
  if (property.type === "select") return property.select?.name ?? "";
  if (property.type === "status") return property.status?.name ?? "";

  return "";
}

function readDateProperty(page: PageObjectResponse, names: string[]): string {
  const property = getPropertyByName(page, names);
  if (property?.type !== "date") return "";
  return property.date?.start ?? "";
}

function readMultiSelectProperty(page: PageObjectResponse, names: string[]): string[] {
  const property = getPropertyByName(page, names);
  if (!property) return [];

  if (property.type === "multi_select") {
    return property.multi_select.map((option) => option.name.trim()).filter(Boolean);
  }

  if (property.type === "rich_text") {
    return parseTags(richTextToPlainText(property.rich_text));
  }

  return [];
}

function readThumbnailProperty(page: PageObjectResponse): string | undefined {
  const prop = getPropertyByName(page, ["thumbnail", "thumb", "cover"]);

  if (prop?.type === "url") return prop.url ?? undefined;
  if (prop?.type === "files") {
    const file = prop.files[0];
    if (!file) return undefined;
    if (file.type === "external") return file.external.url;
    return file.file.url;
  }

  if (page.cover?.type === "external") return page.cover.external.url;
  if (page.cover?.type === "file") return page.cover.file.url;

  return undefined;
}

function isBlockObject(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse {
  return "type" in block;
}

function blockToMarkdownLine(block: BlockObjectResponse): string | null {
  if (block.type === "paragraph") {
    return richTextToPlainText(block.paragraph.rich_text);
  }

  if (block.type === "heading_1") return `# ${richTextToPlainText(block.heading_1.rich_text)}`;
  if (block.type === "heading_2") return `## ${richTextToPlainText(block.heading_2.rich_text)}`;
  if (block.type === "heading_3") return `### ${richTextToPlainText(block.heading_3.rich_text)}`;

  return null;
}

async function loadPageContent(pageId: string): Promise<string> {
  const notion = getNotionClient();
  const lines: string[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100
    });

    response.results.filter(isBlockObject).forEach((block) => {
      const line = blockToMarkdownLine(block);
      if (line) lines.push(line);
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return lines.filter(Boolean).join("\n\n");
}

async function loadDatabase(): Promise<DatabaseObjectResponse> {
  if (!NOTION_DATABASE_ID) {
    throw new Error("NOTION_CONFIG_MISSING");
  }

  const notion = getNotionClient();
  const databaseId = normalizePageId(NOTION_DATABASE_ID);

  try {
    const database = await notion.databases.retrieve({ database_id: databaseId });

    if (!isFullDatabase(database)) {
      throw new Error("NOTION_DATABASE_UNREADABLE");
    }

    return database;
  } catch (error) {
    if (isNotionClientError(error) && error.code === "object_not_found") {
      throw new Error("NOTION_DATABASE_PAGE_NOT_FOUND");
    }

    if (error instanceof Error && NOTION_DATA_UNAVAILABLE_ERRORS.has(error.message)) {
      throw error;
    }

    throw new Error("NOTION_DATABASE_UNREADABLE");
  }
}

async function loadPages(databaseId: string): Promise<PageObjectResponse[]> {
  const notion = getNotionClient();
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100
    });

    response.results.forEach((result) => {
      if (result.object === "page" && isFullPage(result)) {
        pages.push(result);
      }
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return pages;
}

export async function getPosts(): Promise<PostSummary[]> {
  const database = await loadDatabase();
  const pages = await loadPages(database.id);

  const posts = await Promise.all(
    pages.map(async (page) => {
      const title = readTextProperty(page, ["title", "name"]) || "Untitled";
      const slug = readTextProperty(page, ["slug", "url"]) || page.id.replace(/-/g, "");
      const author = readTextProperty(page, ["author", "writer"]) || "Unknown";
      const status = normalizeStatus(readTextProperty(page, ["status", "visibility"]));
      const date = readDateProperty(page, ["date", "publish date", "published"]) || new Date().toISOString().split("T")[0];
      const updateAt = readDateProperty(page, ["updateat", "updated at", "updated"]) || date;
      const summary = readTextProperty(page, ["summary", "description", "excerpt"]);
      const category = readTextProperty(page, ["category"]) || "Uncategorized";
      const tags = readMultiSelectProperty(page, ["tags", "tag"]);
      const thumbnail = readThumbnailProperty(page);

      const contentFromProperty = readTextProperty(page, ["content", "body"]);
      const contentFromBlocks = await loadPageContent(page.id);
      const content = contentFromProperty || contentFromBlocks || summary;

      return {
        id: page.id,
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
  );

  return posts
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
