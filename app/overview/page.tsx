import type { Route } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeaturedPostCard } from "@/components/post/FeaturedPostCard";
import { PostListItem } from "@/components/post/PostListItem";
import { getPosts } from "@/lib/notion";

export default async function OverviewPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 4);
  const highlighted = rest.slice(4, 8);

  return (
    <main>
      <Header />
      <Hero />

      <section className="container section-gap overview-main-grid">
        <div>
          <div className="section-title-row">
            <h2>Editor&apos;s Pick</h2>
            <p>이번 주 가장 주목할 아티클</p>
          </div>
          {featured ? <FeaturedPostCard post={featured} /> : null}
        </div>

        <aside className="overview-aside">
          <h3>Quick Reads</h3>
          <ul>
            {rest.slice(0, 5).map((post) => (
              <li key={post.id}>
                <Link href={`/articles/${post.slug}` as Route}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="container section-gap">
        <div className="section-title-row">
          <h2>Latest Writings</h2>
          <p>최근 업데이트된 글</p>
        </div>
        <div className="list-layout">
          {latest.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>

      {!!highlighted.length && (
        <section className="container section-gap">
          <div className="section-title-row">
            <h2>More from Archive</h2>
          </div>
          <div className="overview-archive-grid">
            {highlighted.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
