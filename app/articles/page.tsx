import { Header } from "@/components/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPosts } from "@/lib/notion";

export default async function ArticlesPage() {
  const posts = await getPosts();

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap">
        <div className="section-title-row">
          <h1>Articles</h1>
          <p>전체 게시글 목록입니다.</p>
        </div>
        <div className="list-layout">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
