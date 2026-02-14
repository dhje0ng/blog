import { Client } from "@notionhq/client";

const notionToken = process.env.NOTION_TOKEN?.trim() ?? "";

export function getNotionClient(): Client {
  if (!notionToken) {
    throw new Error("NOTION_TOKEN_MISSING");
  }

  return new Client({ auth: notionToken });
}
