import { notFound } from "next/navigation";
import { ArticlesSearchClient } from "@/app/articles/ArticlesSearchClient";
import { Header } from "@/components/layout/Header";
import { getPostsOrNull } from "@/lib/notion/safe";

export const dynamic = "force-dynamic";

type ArticlesPageProps = {
  searchParams: Promise<{
    q?: string;
    section?: "popular" | "recent";
  }>;
};

function isPinnedPost(tags: string[]): boolean {
  return tags.some((tag) => tag.toLowerCase() === "pinned");
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { q, section } = await searchParams;
  const posts = await getPostsOrNull();

  if (!posts) {
    notFound();
  }

  const query = q?.trim() ?? "";

  const sectionFilteredPosts =
    section === "popular"
      ? posts.filter((post) => isPinnedPost(post.tags))
      : section === "recent"
        ? posts
        : posts;

  const sectionTitle = section === "popular" ? "인기 아티클" : section === "recent" ? "최근 아티클" : "Articles";
  const sectionDescription =
    section === "popular"
      ? "인기 아티클 섹션에 등록된 게시글 목록입니다."
      : section === "recent"
        ? "최근 순으로 정렬된 전체 아티클 목록입니다."
        : "전체 게시글 목록입니다.";

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap mobile-viewer-page">
        <div className="section-title-row">
          <h1>{sectionTitle}</h1>
          <p>{sectionDescription}</p>
        </div>

        <ArticlesSearchClient posts={sectionFilteredPosts} initialQuery={query} />
      </section>
    </main>
  );
}
