import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturedPostCard } from "@/components/post/FeaturedPostCard";
import { PostListItem } from "@/components/post/PostListItem";
import { getPosts } from "@/lib/notion";

export default async function OverviewPage() {
  const posts = await getPosts();
  const [featured, ...latest] = posts;

  return (
    <main>
      <Header />
      <Hero />
      <section className="container section-gap">
        <div className="section-title-row">
          <h2>Overview</h2>
          <p>최근 업데이트와 대표 글을 한 번에 확인하세요.</p>
        </div>
        {featured ? <FeaturedPostCard post={featured} /> : null}
      </section>
      <section className="container section-gap">
        <div className="section-title-row">
          <h2>Latest Writings</h2>
        </div>
        <div className="list-layout">
          {latest.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
