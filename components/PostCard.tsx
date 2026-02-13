import { PostSummary } from "@/lib/types";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="post-list-item">
      <div>
        <span className="list-item-category">{post.category}</span>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
      </div>
      <div className="post-meta-row">
        <time>{post.updatedAt}</time>
        <span>{post.readingMinutes} min</span>
      </div>
    </article>
  );
}
