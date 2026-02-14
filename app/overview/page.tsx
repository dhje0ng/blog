import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { OverviewTools } from "@/components/layout/OverviewTools";
import { PostListItem } from "@/components/post/PostListItem";
import { getPostsOrNull } from "@/lib/notion/safe";
import siteConfig from "@/site.config";

export const dynamic = "force-dynamic";

function SocialLogo({ name }: { name: string }) {
  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42a3.18 3.18 0 0 0-1.34-1.76c-1.09-.74.08-.72.08-.72a2.5 2.5 0 0 1 1.83 1.23a2.54 2.54 0 0 0 3.47 1a2.54 2.54 0 0 1 .76-1.59c-2.66-.3-5.47-1.34-5.47-5.94a4.64 4.64 0 0 1 1.24-3.22a4.32 4.32 0 0 1 .12-3.18s1-.33 3.3 1.23a11.38 11.38 0 0 1 6 0c2.27-1.56 3.3-1.23 3.3-1.23a4.32 4.32 0 0 1 .12 3.18a4.64 4.64 0 0 1 1.24 3.22c0 4.61-2.81 5.64-5.49 5.94a2.84 2.84 0 0 1 .81 2.2v3.26c0 .32.22.69.83.58A12 12 0 0 0 12 .5"
        />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.45 20.45h-3.56v-5.59c0-1.33-.03-3.03-1.85-3.03c-1.86 0-2.14 1.44-2.14 2.93v5.69H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.33 7.43a2.06 2.06 0 1 1 0-4.12a2.06 2.06 0 0 1 0 4.12m1.78 13.02H3.55V9h3.56zM22.23 0H1.77A1.77 1.77 0 0 0 0 1.77v20.46C0 23.21.79 24 1.77 24h20.46A1.77 1.77 0 0 0 24 22.23V1.77A1.77 1.77 0 0 0 22.23 0"
        />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M18.9 2H22l-6.77 7.73L23.2 22h-6.27l-4.9-6.41L6.42 22H3.3l7.24-8.27L.8 2h6.43l4.43 5.85zm-1.1 18.1h1.73L6.29 3.8H4.43z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M2 6.5A2.5 2.5 0 0 1 4.5 4h15A2.5 2.5 0 0 1 22 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5zm2.7-.5L12 11.2L19.3 6zM20 7.1l-8 5.7l-8-5.7v10.4a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5z" />
    </svg>
  );
}

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
                <ul className="profile-social-links" aria-label="social links">
                  {socialLinks.map(([name, href]) => (
                    <li key={name}>
                      <a href={href} target="_blank" rel="noreferrer" aria-label={name}>
                        <span aria-hidden="true" className="social-logo-wrap">
                          <SocialLogo name={name} />
                        </span>
                        <span className="sr-only">{name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="profile-intro">{siteConfig.profile.intro}</p>
          </aside>

          <div className="overview-content-column">
            <OverviewTools />

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
