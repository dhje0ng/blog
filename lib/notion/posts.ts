import { isNotionClientError } from "@notionhq/client";
import { unstable_cache } from "next/cache";
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

function richTextToMarkdown(value: RichTextItemResponse[]): string {
  return value
    .map((item) => {
      const text = item.plain_text;
      if (!text) return "";

      const href = item.href ?? (item.type === "text" ? item.text.link?.url : undefined);
      let decorated = href ? `[${text}](${href})` : text;

      if (item.annotations.code) decorated = `\`${decorated}\``;
      if (item.annotations.bold) decorated = `**${decorated}**`;
      if (item.annotations.italic) decorated = `*${decorated}*`;
      if (item.annotations.strikethrough) decorated = `~~${decorated}~~`;

      return decorated;
    })
    .join("")
    .trim();
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

function getUserName(user: { name?: string } | Record<string, unknown>): string {
  if (!("name" in user)) return "";

  const name = user.name;
  return typeof name === "string" ? name.trim() : "";
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
  if (property.type === "people") {
    return property.people
      .map((person) => getUserName(person))
      .filter((name): name is string => Boolean(name))
      .join(", ");
  }
  if (property.type === "created_by") return getUserName(property.created_by);

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
    const fileItem = prop.files[0];
    if (!fileItem) return undefined;
    if ("external" in fileItem) return fileItem.external.url;
    if ("file" in fileItem) return fileItem.file.url;
    return undefined;
  }

  if (page.cover && "external" in page.cover) return page.cover.external.url;
  if (page.cover && "file" in page.cover) return page.cover.file.url;

  return undefined;
}

function isBlockObject(block: BlockObjectResponse | PartialBlockObjectResponse): block is BlockObjectResponse {
  return "type" in block;
}

function blockToMarkdownLines(block: BlockObjectResponse, depth = 0): string[] {
  const indent = "  ".repeat(depth);

  if (block.type === "paragraph") {
    const text = richTextToMarkdown(block.paragraph.rich_text);
    return text ? [text] : [];
  }

  if (block.type === "heading_1") return [`# ${richTextToMarkdown(block.heading_1.rich_text)}`];
  if (block.type === "heading_2") return [`## ${richTextToMarkdown(block.heading_2.rich_text)}`];
  if (block.type === "heading_3") return [`### ${richTextToMarkdown(block.heading_3.rich_text)}`];
  if (block.type === "bulleted_list_item") return [`${indent}- ${richTextToMarkdown(block.bulleted_list_item.rich_text)}`];
  if (block.type === "numbered_list_item") return [`${indent}1. ${richTextToMarkdown(block.numbered_list_item.rich_text)}`];
  if (block.type === "quote") return [`> ${richTextToMarkdown(block.quote.rich_text)}`];
  if (block.type === "callout") return [`> ${richTextToMarkdown(block.callout.rich_text)}`];
  if (block.type === "code") {
    const language = block.code.language?.trim();
    const fence = language ? `\`\`\`${language}` : "```";
    return [fence, block.code.rich_text.map((text) => text.plain_text).join(""), "```"];
  }
  if (block.type === "to_do") {
    const prefix = block.to_do.checked ? "[x]" : "[ ]";
    return [`${indent}- ${prefix} ${richTextToMarkdown(block.to_do.rich_text)}`];
  }
  if (block.type === "toggle") {
    const text = richTextToMarkdown(block.toggle.rich_text);
    return text ? [`${indent}- ${text}`] : [];
  }
  if (block.type === "divider") return ["---"];
  if (block.type === "bookmark") return block.bookmark.url ? [`[${block.bookmark.url}](${block.bookmark.url})`] : [];
  if (block.type === "embed") return block.embed.url ? [`[${block.embed.url}](${block.embed.url})`] : [];
  if (block.type === "link_preview") return block.link_preview.url ? [`[${block.link_preview.url}](${block.link_preview.url})`] : [];
  if (block.type === "image") {
    const src = "external" in block.image ? block.image.external.url : block.image.file.url;
    const caption = richTextToMarkdown(block.image.caption) || "image";
    return src ? [`![${caption}](${src})`] : [];
  }

  return [];
}

async function loadBlockChildren(blockId: string): Promise<BlockObjectResponse[]> {
  const notion = getNotionClient();
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100
    });

    response.results.filter(isBlockObject).forEach((block) => {
      blocks.push(block);
    });

    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

async function blocksToMarkdownLines(blocks: BlockObjectResponse[], depth = 0): Promise<string[]> {
  const lines: string[] = [];

  for (const block of blocks) {
    lines.push(...blockToMarkdownLines(block, depth));

    if (block.has_children) {
      const childBlocks = await loadBlockChildren(block.id);
      lines.push(...(await blocksToMarkdownLines(childBlocks, depth + 1)));
    }
  }

  return lines;
}

async function loadPageContent(pageId: string): Promise<string> {
  const lines = await blocksToMarkdownLines(await loadBlockChildren(pageId));
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

async function fetchPosts(): Promise<PostSummary[]> {
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

const getPostsCached = unstable_cache(fetchPosts, ["notion-posts"], {
  revalidate: 300,
  tags: ["notion-posts"]
});

export async function getPosts(): Promise<PostSummary[]> {
  return getPostsCached();
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
