import { PostSummary } from "@/lib/types";

export function FeaturedPostCard({ post }: { post: PostSummary }) {
  return (
    <article className="featured-card">
      <div className="featured-cover" style={{ backgroundImage: `url(${post.coverImage ?? ""})` }} aria-hidden="true" />
      <div className="featured-content">
        <span className="featured-category">{post.category}</span>
        <h2>{post.title}</h2>
        <p>{post.summary}</p>
        <div className="post-meta-row">
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
