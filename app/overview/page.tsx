import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPostsOrNull } from "@/lib/notion/safe";
import siteConfig from "@/site.config";

export const dynamic = "force-dynamic";

function isPinnedPost(tags: string[]): boolean {
  return tags.some((tag) => tag.toLowerCase() === "pinned");
}

export default async function OverviewPage() {
  const posts = await getPostsOrNull();

  if (!posts) {
    notFound();
  }

  const popular = posts.filter((post) => isPinnedPost(post.tags));
  const recent = posts;
  const collectionCount = new Set(posts.map((post) => post.category)).size;
  const socialLinks = Object.entries(siteConfig.social).filter(([, href]) => Boolean(href));

  return (
    <main>
      <Header />
      <section className="container overview-layout top-gap section-gap">
        <div className="overview-main-layout">
          <aside className="overview-profile-column">
            <div className="readme-head-row">
              <Image src={siteConfig.profile.avatar} alt={`${siteConfig.profile.name} profile`} className="profile-avatar" width={88} height={88} />
              <div>
                <h1 className="profile-name">{siteConfig.profile.name}</h1>
                <p className="profile-handle">{siteConfig.profile.handle}</p>
              </div>
            </div>
            <p className="profile-intro">{siteConfig.profile.intro}</p>
            <ul className="readme-bullet-list" aria-label="social links">
              {socialLinks.map(([name, href]) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div className="overview-content-column">
            <nav className="overview-inline-menu" aria-label="overview menu links">
              <Link href="/overview">overview</Link>
              <Link href="/collection">collection ({collectionCount})</Link>
              <Link href="/articles">article ({posts.length})</Link>
            </nav>

            <article className="overview-readme" aria-label="profile introduction">
              <h2>Hi there, I&apos;m {siteConfig.profile.name} 👋</h2>
              <ul className="readme-bullet-list">
                <li>📝 기록 중: {posts.length}개의 글을 발행했어요.</li>
                <li>⚙️ 작업 방식: 노션 데이터베이스를 기준으로 블로그를 동기화합니다.</li>
                <li>🔎 관심사: Frontend DX, UI 디자인 시스템, 생산성 워크플로우.</li>
              </ul>
            </article>

            <section className="overview-section">
              <div className="overview-section-head">
                <h2>인기 아티클</h2>
                <Link href="/articles?section=popular" className="section-more-link">
                  더보기
                </Link>
              </div>
              <div className="popular-grid">
                {popular.map((post, index) => (
                  <Link key={post.id} href={`/articles/${post.slug}` as Route} className="popular-card">
                    <div className="popular-preview" style={{ backgroundImage: `url(${post.thumbnail ?? ""})` }} aria-hidden="true" />
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
                <Link href="/articles?section=recent" className="section-more-link">
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
        </div>
      </section>
    </main>
  );
}
