import { PostSummary } from "@/lib/types";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="post-card">
      <div className="post-meta-row">
        <time>{post.updatedAt}</time>
        <span>{post.readingMinutes} min read</span>
      </div>
      <h2>{post.title}</h2>
      <p>{post.summary}</p>
      <div className="tag-list" aria-label="tags">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
