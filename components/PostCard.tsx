import styles from "@/components/post/PostCard.module.css";
import { PostSummary } from "@/lib/types";

const PLACEHOLDER_LABEL = "No image";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className={styles.postCard}>
      <div className={styles.postCard__thumb} aria-hidden="true">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.postCard__image} src={post.coverImage} alt="" loading="lazy" />
        ) : (
          <div className={styles.postCard__placeholder}>{PLACEHOLDER_LABEL}</div>
        )}
      </div>

      <div className={styles.postCard__content}>
        {post.category && <p className={styles.postCard__category}>{post.category}</p>}
        <h3 className={styles.postCard__title}>{post.title}</h3>
        <p className={styles.postCard__summary}>{post.summary}</p>

        <div className={styles.postCard__meta}>
          <time>{post.updatedAt}</time>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
