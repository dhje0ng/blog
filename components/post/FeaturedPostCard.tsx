import { FeaturedPost } from "@/lib/types";

export function FeaturedPostCard({ post }: { post: FeaturedPost }) {
  return (
    <article className="featured-post-card">
      <p className="featured-label">Featured</p>
      <h2>{post.title}</h2>
      <p>{post.summary}</p>
      <div className="post-meta-row">
        <time>{post.updatedAt}</time>
        <span>{post.readingMinutes} min read</span>
      </div>
      <div className="tag-list" aria-label="featured tags">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
