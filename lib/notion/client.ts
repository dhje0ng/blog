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
    console.log("[Notion Debug] getPage called", { pageId });
    const recordMap: NotionRecordMap = { block: {}, collection: {} };
    let cursor: { stack: unknown[] } = { stack: [] };

    for (let i = 0; i < 10; i += 1) {
      console.log("[Notion Debug] loadPageChunk request", {
        pageId,
        chunkNumber: i,
        cursorStackSize: cursor.stack.length
      });

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
        console.log("[Notion Debug] loadPageChunk failed", {
          pageId,
          chunkNumber: i,
          status: response.status,
          statusText: response.statusText
        });
        throw new Error("NOTION_FETCH_FAILED");
      }

      const data = (await response.json()) as LoadPageChunkResponse;
      const nextRecordMap = data.recordMap ?? {};

      Object.assign(recordMap.block ?? {}, nextRecordMap.block ?? {});
      Object.assign(recordMap.collection ?? {}, nextRecordMap.collection ?? {});

      const nextStack = data.cursor?.stack ?? [];
      console.log("[Notion Debug] loadPageChunk success", {
        pageId,
        chunkNumber: i,
        blockCount: Object.keys(recordMap.block ?? {}).length,
        collectionCount: Object.keys(recordMap.collection ?? {}).length,
        nextStackSize: nextStack.length
      });

      if (!nextStack.length) break;
      cursor = { stack: nextStack };
    }

    console.log("[Notion Debug] getPage completed", {
      pageId,
      blockCount: Object.keys(recordMap.block ?? {}).length,
      collectionCount: Object.keys(recordMap.collection ?? {}).length
    });

    return recordMap;
  }
}
