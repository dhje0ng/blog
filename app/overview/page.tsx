import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPostsOrNull } from "@/lib/notion/safe";

export const dynamic = "force-dynamic";

const PROFILE = {
  name: "Donghyeon Jeong",
  handle: "@dhjeong",
  intro: "개발과 디자인, 생산성을 기록합니다.",
  avatar: "https://avatars.githubusercontent.com/u/9919?v=4"
};

export default async function OverviewPage() {
  const posts = await getPostsOrNull();

  if (!posts) {
    notFound();
  }

  const popular = posts.slice(0, 3);
  const recent = posts.slice(3);

  return (
    <main>
      <Header />
      <section className="container overview-layout top-gap section-gap">
        <aside className="profile-column">
          <article className="profile-card">
            <Image src={PROFILE.avatar} alt={`${PROFILE.name} profile`} className="profile-avatar" width={320} height={320} />
            <h1>{PROFILE.name}</h1>
            <p className="profile-handle">{PROFILE.handle}</p>
            <p className="profile-intro">{PROFILE.intro}</p>
            <div className="profile-meta-row">
              <span>{posts.length} posts</span>
              <span>Notion DB Sync</span>
            </div>
          </article>

          <article className="overview-intro-card">
            <h2>Overview</h2>
            <nav className="overview-quick-nav" aria-label="overview quick links">
              <Link href="/articles">Articles</Link>
              <Link href="/collection">Collection</Link>
            </nav>
          </article>
        </aside>

        <div className="overview-content-column">
          <section className="overview-section">
            <div className="overview-section-head">
              <h2>인기 아티클</h2>
              <Link href="/articles" className="section-more-link">
                더보기
              </Link>
            </div>
            <div className="popular-grid">
              {popular.map((post, index) => (
                <Link key={post.id} href={`/articles/${post.slug}` as Route} className="popular-card">
                  <span className="popular-rank">#{index + 1}</span>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="overview-section">
            <div className="overview-section-head">
              <h2>최근 아티클</h2>
              <Link href="/articles" className="section-more-link">
                더보기
              </Link>
            </div>
            <div className="list-layout">
              {recent.map((post) => (
                <PostListItem key={post.id} post={post} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
