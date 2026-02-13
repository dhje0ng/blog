import { PostSummary } from "@/lib/types";

const PLACEHOLDER_LABEL = "No image";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="post-media-card">
      <div className="post-media-thumb" aria-hidden="true">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" loading="lazy" />
        ) : (
          <div className="post-media-placeholder">{PLACEHOLDER_LABEL}</div>
        )}
      </div>

      <div className="post-media-content">
        {post.category && <p className="post-category-badge">{post.category}</p>}
        <h3>{post.title}</h3>
        <p>{post.summary}</p>

        <div className="post-meta-row">
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
