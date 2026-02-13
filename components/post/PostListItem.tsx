import styles from "@/app/home.module.css";
import { PostListItem as PostListItemView } from "@/lib/types";

export function PostListItem({ post }: { post: PostListItemView }) {
  return (
    <article>
      <div>
        <h3>{post.title}</h3>
        <p>{post.summary}</p>
      </div>
      <div>
        <div className={styles.home__metaRow}>
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
        <div className={styles.home__tagList} aria-label="post tags">
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.home__tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
