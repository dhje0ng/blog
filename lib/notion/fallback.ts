import type { PostSummary } from "@/lib/models/post";

export const FALLBACK_POSTS: PostSummary[] = [
  {
    id: "fallback-post-1",
    title: "노션 연동 오류 시 표시되는 예시 게시글",
    slug: "fallback-notion-sync-error",
    author: "N-Blog",
    status: "public",
    date: "2026-01-01",
    updateAt: "2026-01-01",
    summary: "노션 연동에 실패하면 404 대신 이 예시 게시글 목록을 보여줍니다.",
    tags: ["fallback", "notion", "pinned"],
    category: "Notice",
    readingMinutes: 1,
    thumbnail:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    content:
      "현재 노션 데이터베이스에 연결할 수 없어 예시 게시글을 표시하고 있습니다.\n\nNOTION_DATABASE_ID와 네트워크 연결 상태를 확인해 주세요."
  }
];
