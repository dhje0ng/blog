export type NotionRecordMap = {
  block?: Record<string, { value?: Record<string, unknown> }>;
  collection?: Record<string, { value?: Record<string, unknown> }>;
};

type LoadPageChunkResponse = {
  recordMap?: NotionRecordMap;
  cursor?: {
    stack?: unknown[];
  };
};

export class NotionAPI {
  async getPage(pageId: string): Promise<NotionRecordMap> {
    const recordMap: NotionRecordMap = { block: {}, collection: {} };
    let cursor: { stack: unknown[] } = { stack: [] };

    for (let i = 0; i < 10; i += 1) {
      const response = await fetch("https://www.notion.so/api/v3/loadPageChunk", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          pageId,
          limit: 100,
          cursor,
          chunkNumber: i,
          verticalColumns: false
        }),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("NOTION_FETCH_FAILED");
      }

      const data = (await response.json()) as LoadPageChunkResponse;
      const nextRecordMap = data.recordMap ?? {};

      Object.assign(recordMap.block ?? {}, nextRecordMap.block ?? {});
      Object.assign(recordMap.collection ?? {}, nextRecordMap.collection ?? {});

      const nextStack = data.cursor?.stack ?? [];

      if (!nextStack.length) break;
      cursor = { stack: nextStack };
    }

    return recordMap;
  }
}
