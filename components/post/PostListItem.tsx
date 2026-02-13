import type { Route } from "next";
import Link from "next/link";
import { PostSummary } from "@/lib/types";

export function PostListItem({ post }: { post: PostSummary }) {
  return (
    <article className="post-list-item">
      <Link className="post-link" href={`/articles/${post.slug}` as Route}>
        <div>
          <span className="list-item-category">{post.category}</span>
          <h3>{post.title}</h3>
          <p>{post.summary}</p>
        </div>
        <div className="post-meta-row">
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min</span>
        </div>
      </Link>
    </article>
  );
}
