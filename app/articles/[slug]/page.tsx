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

  const lines = (post.content ?? post.summary)
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const contentBlocks = lines.map((line, index) => {
    const markdownImageMatch = line.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);

    if (markdownImageMatch) {
      return {
        id: `${post.id}-image-${index}`,
        type: "image" as const,
        src: markdownImageMatch[2],
        alt: markdownImageMatch[1] || post.title
      };
    }

    const plainImageUrlMatch = line.match(/^(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)(?:\?\S*)?)$/i);

    if (plainImageUrlMatch) {
      return {
        id: `${post.id}-image-${index}`,
        type: "image" as const,
        src: plainImageUrlMatch[1],
        alt: post.title
      };
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (!headingMatch) {
      return { id: `${post.id}-paragraph-${index}`, type: "paragraph" as const, text: line };
    }

    const level = Math.min(headingMatch[1].length, 3);
    const text = headingMatch[2];
    const anchorId = `${post.slug}-toc-${text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")}`;

    return {
      id: `${post.id}-heading-${index}`,
      type: "heading" as const,
      text,
      level,
      anchorId
    };
  });

  const tableOfContents = contentBlocks.filter((block): block is Extract<(typeof contentBlocks)[number], { type: "heading" }> => block.type === "heading");

  return (
    <main>
      <Header />
      <article className="post-detail-wrap mobile-viewer-page mobile-viewer-detail">
        <div className="post-detail-head container-narrow">
          <p className="post-detail-kicker">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="post-detail-summary">{post.summary}</p>
          <div className="post-detail-meta">
            <span>{post.author}</span>
            <span>·</span>
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

        <div className="post-detail-content-grid container-narrow">
          <div className="post-detail-body">
            {contentBlocks.map((block) => {
              if (block.type === "heading") {
                if (block.level === 1) {
                  return (
                    <h2 key={block.id} id={block.anchorId}>
                      {block.text}
                    </h2>
                  );
                }

                if (block.level === 2) {
                  return (
                    <h3 key={block.id} id={block.anchorId}>
                      {block.text}
                    </h3>
                  );
                }

                return (
                  <h4 key={block.id} id={block.anchorId}>
                    {block.text}
                  </h4>
                );
              }

              if (block.type === "image") {
                return (
                  <figure key={block.id} className="post-detail-inline-image-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.src} alt={block.alt} className="post-detail-inline-image" loading="lazy" />
                  </figure>
                );
              }

              return <p key={block.id}>{block.text}</p>;
            })}
            {!!post.tags.length && (
              <ul className="post-tag-list" aria-label="post tags">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>

          {!!tableOfContents.length && (
            <aside className="post-toc-sidebar" aria-label="Table of Contents">
              <section className="post-toc">
                <h2>Table of Contents</h2>
                <ol>
                  {tableOfContents.map((heading) => (
                    <li key={heading.id} className={`post-toc-depth-${heading.level}`}>
                      <a href={`#${heading.anchorId}`}>{heading.text}</a>
                    </li>
                  ))}
                </ol>
              </section>
            </aside>
          )}
        </div>
      </article>
    </main>
  );
}
