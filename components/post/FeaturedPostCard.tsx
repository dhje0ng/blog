import type { Route } from "next";
import Link from "next/link";
import { PostSummary } from "@/lib/models/post";

export function FeaturedPostCard({ post }: { post: PostSummary }) {
  return (
    <article className="featured-card">
      <Link className="featured-link" href={`/articles/${post.slug}` as Route}>
        <div className="featured-cover" style={{ backgroundImage: `url(${post.thumbnail ?? ""})` }} aria-hidden="true" />
        <div className="featured-content">
          <span className="featured-category">{post.category}</span>
          <h2>{post.title}</h2>
          <p>{post.summary}</p>
          <div className="post-meta-row">
            <time>{post.updateAt}</time>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
