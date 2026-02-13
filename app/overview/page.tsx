import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPosts } from "@/lib/notion";

export const dynamic = "force-dynamic";

const PROFILE = {
  name: "morethanmin",
  handle: "@morethan-log",
  intro: "프론트엔드 개발자 · 노션 기반 글쓰기를 꾸준히 기록합니다.",
  avatar: "https://avatars.githubusercontent.com/u/9919?v=4"
};

export default async function OverviewPage() {
  const posts = await getPosts();
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
            <h2>Welcome 👋</h2>
            <p>노션 데이터베이스와 연동된 블로그입니다. 기술, 디자인, 생산성에 관한 글을 정리합니다.</p>
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
                  <span className="popular-rank">TOP {index + 1}</span>
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
