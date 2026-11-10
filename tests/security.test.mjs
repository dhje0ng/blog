import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeStatus, normalizePostSlug } from "../lib/security/publication.ts";
import { escapeXml } from "../lib/security/xml.ts";

test("publishing is explicit and fails closed for drafts and missing states", () => {
  for (const status of ["", "private", "draft", "Draft", "unlisted", "published", "publci", "공개", "false"]) {
    assert.equal(normalizeStatus(status), "private", status);
  }
  assert.equal(normalizeStatus(" public "), "public");
  assert.equal(normalizeStatus("PUBLIC"), "public");
});

test("slug cannot inject XML, change the route, query, fragment or scheme", () => {
  for (const slug of ["../private", "a/b", "a?token=x", "a#fragment", "%2e%2e", "https://evil.test", '<x>"&', "..", "a\u0000b"]) {
    assert.equal(normalizePostSlug(slug, "1234-abcd"), "1234abcd", slug);
  }
  assert.equal(normalizePostSlug("보안-분석_2026", "fallback"), "보안-분석_2026");
});

test("RSS escapes XML text and attribute delimiters and removes forbidden controls", () => {
  assert.equal(escapeXml('<item a="x">&\'</item>\u0000'), "&lt;item a=&quot;x&quot;&gt;&amp;&apos;&lt;/item&gt;");
  assert.equal(escapeXml("https://example.test/?a=1&b=2"), "https://example.test/?a=1&amp;b=2");
  assert.equal(escapeXml("정상\n본문\t내용"), "정상\n본문\t내용");
});

test("Notion publication pipeline excludes private/draft/missing states before loading content", async () => {
  const { createRequire } = await import("node:module");
  const { readFileSync } = await import("node:fs");
  const { runInNewContext } = await import("node:vm");
  const require = createRequire(import.meta.url);
  const ts = require("typescript");
  const loadedContent = [];
  const pages = ["public", "private", "draft", ""].map((status, index) => ({
    object: "page",
    id: `page-${index}`,
    properties: {
      status: { type: "select", select: { name: status } },
      title: { type: "title", title: [{ plain_text: `Title ${index}` }] },
      slug: { type: "rich_text", rich_text: [{ plain_text: index === 0 ? '<item>&"' : `post-${index}` }] }
    }
  }));
  const client = {
    databases: {
      retrieve: async () => ({ id: "database", title: [] }),
      query: async () => ({ results: pages, has_more: false })
    },
    blocks: { children: { list: async ({ block_id }) => {
      loadedContent.push(block_id);
      return { results: [], has_more: false };
    } } }
  };
  const compiled = ts.transpileModule(readFileSync(new URL("../lib/notion/posts.ts", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  }).outputText;
  const exports = {};
  runInNewContext(compiled, {
    exports,
    require: (id) => {
      if (id === "@notionhq/client") return { isNotionClientError: () => false };
      if (id === "next/cache") return { unstable_cache: (fn) => fn };
      if (id === "@/lib/notion/client") return { getNotionClient: () => client };
      if (id === "@/lib/notion/revalidate") return { NOTION_REVALIDATE_SECONDS: 900 };
      if (id === "@/lib/security/publication") return { normalizeStatus, normalizePostSlug };
      if (id === "@/site.config") return { notion: { notion_page_id: "a".repeat(32) } };
      throw new Error(`Unexpected import: ${id}`);
    }
  });
  const posts = await exports.getPosts();
  assert.equal(posts.length, 1);
  assert.equal(posts[0].id, "page-0");
  assert.equal(posts[0].slug, "page0");
  assert.deepEqual(loadedContent, ["page-0"]);
  assert.equal(await exports.getPostBySlug("post-1"), null);
});
