import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPostsOrNull } from "@/lib/notion/safe";

export const dynamic = "force-dynamic";

type ArticlesPageProps = {
  searchParams: {
    q?: string;
    section?: "popular" | "recent";
  };
};

function includesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

function isPinnedPost(tags: string[]): boolean {
  return tags.some((tag) => tag.toLowerCase() === "pinned");
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const posts = await getPostsOrNull();

  if (!posts) {
    notFound();
  }

  const query = searchParams.q?.trim() ?? "";
  const section = searchParams.section;

  const sectionFilteredPosts =
    section === "popular"
      ? posts.filter((post) => isPinnedPost(post.tags))
      : section === "recent"
        ? posts.filter((post) => !isPinnedPost(post.tags))
        : posts;

  const filteredPosts = query
    ? sectionFilteredPosts.filter((post) =>
        includesQuery(`${post.title} ${post.summary} ${post.tags.join(" ")} ${post.category}`, query)
      )
    : sectionFilteredPosts;

  const sectionTitle = section === "popular" ? "인기 아티클" : section === "recent" ? "최근 아티클" : "Articles";
  const sectionDescription =
    section === "popular"
      ? "인기 아티클 섹션에 등록된 게시글 목록입니다."
      : section === "recent"
        ? "최근 아티클 섹션에 등록된 게시글 목록입니다."
        : "전체 게시글 목록입니다.";

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap">
        <div className="section-title-row">
          <h1>{sectionTitle}</h1>
          <p>{sectionDescription}</p>
        </div>

        <form className="articles-search" method="get" action="/articles">
          <input type="hidden" name="section" value={section ?? ""} />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="아티클 검색 (제목, 요약, 태그)"
            aria-label="Search articles"
          />
          <button type="submit">검색</button>
        </form>

        {query ? <p className="search-result-meta">&quot;{query}&quot; 검색 결과: {filteredPosts.length}개</p> : null}

        <div className="list-layout">
          {filteredPosts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
