import { Header } from "@/components/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPosts } from "@/lib/notion";

export const dynamic = "force-dynamic";

type ArticlesPageProps = {
  searchParams: {
    q?: string;
  };
};

function includesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const posts = await getPosts();
  const query = searchParams.q?.trim() ?? "";

  const filteredPosts = query
    ? posts.filter((post) =>
        includesQuery(`${post.title} ${post.summary} ${post.tags.join(" ")} ${post.category}`, query)
      )
    : posts;

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap">
        <div className="section-title-row">
          <h1>Articles</h1>
          <p>전체 게시글 목록입니다.</p>
        </div>

        <form className="articles-search" method="get" action="/articles">
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
