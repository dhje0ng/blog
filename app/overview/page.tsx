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
        <div className="overview-content-column">
          <article className="overview-readme" aria-label="profile introduction">
            <div className="readme-head-row">
              <Image src={PROFILE.avatar} alt={`${PROFILE.name} profile`} className="profile-avatar" width={88} height={88} />
              <div>
                <h1>Hi there, I&apos;m {PROFILE.name} 👋</h1>
                <p className="profile-handle">{PROFILE.handle}</p>
              </div>
            </div>
            <p className="profile-intro">{PROFILE.intro}</p>
            <ul className="readme-bullet-list">
              <li>📝 기록 중: {posts.length}개의 글을 발행했어요.</li>
              <li>⚙️ 작업 방식: 노션 데이터베이스를 기준으로 블로그를 동기화합니다.</li>
              <li>🔎 관심사: Frontend DX, UI 디자인 시스템, 생산성 워크플로우.</li>
            </ul>
            <nav className="overview-quick-nav" aria-label="overview quick links">
              <Link href="/articles">Articles</Link>
              <Link href="/collection">Collection</Link>
            </nav>
          </article>

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
                  <div className="popular-preview" style={{ backgroundImage: `url(${post.coverImage ?? ""})` }} aria-hidden="true" />
                  <div>
                    <span className="popular-rank">#{index + 1}</span>
                    <h3>{post.title}</h3>
                    <p>{post.summary}</p>
                  </div>
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
                <PostListItem key={post.id} post={post} withPreview />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
