import { PostListItem as PostListItemView } from "@/lib/types";

export function PostListItem({ post }: { post: PostListItemView }) {
  return (
    <article className="post-list-item">
      <div>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
      </div>
      <div className="post-list-footer">
        <div className="post-meta-row">
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
        <div className="tag-list" aria-label="post tags">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
