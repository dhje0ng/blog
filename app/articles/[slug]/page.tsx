import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { getPostBySlugOrNull } from "@/lib/notion/safe";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugOrNull(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: `${post.title} | N-Blog`,
    description: post.summary
  };
}

export default async function ArticleDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlugOrNull(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = (post.content ?? post.summary)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <main>
      <Header />
      <article className="post-detail-wrap">
        <div className="post-detail-head container-narrow">
          <p className="post-detail-kicker">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="post-detail-summary">{post.summary}</p>
          <div className="post-detail-meta">
            <time>{post.updateAt}</time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>

        {post.thumbnail ? (
          <div className="post-detail-cover-wrap container-narrow">
            <div className="post-detail-cover" style={{ backgroundImage: `url(${post.thumbnail})` }} aria-hidden="true" />
          </div>
        ) : null}

        <div className="post-detail-body container-narrow">
          {paragraphs.map((paragraph, idx) => (
            <p key={`${post.id}-${idx}`}>{paragraph}</p>
          ))}
          {!!post.tags.length && (
            <ul className="post-tag-list" aria-label="post tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </main>
  );
}
