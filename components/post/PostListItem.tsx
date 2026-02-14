import type { Route } from "next";
import Link from "next/link";
import { PostSummary } from "@/lib/models/post";

type PostListItemProps = {
  post: PostSummary;
  withPreview?: boolean;
};

export function PostListItem({ post, withPreview = false }: PostListItemProps) {
  return (
    <article className="post-list-item">
      <Link className="post-link" href={`/articles/${post.slug}` as Route}>
        <div className={withPreview ? "post-list-body with-preview" : "post-list-body"}>
          {withPreview ? (
            <div className="post-list-preview" style={{ backgroundImage: `url(${post.coverImage ?? ""})` }} aria-hidden="true" />
          ) : null}
          <div>
            <span className="list-item-category">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
          </div>
        </div>
        <div className="post-meta-row">
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min</span>
        </div>
      </Link>
    </article>
  );
}
