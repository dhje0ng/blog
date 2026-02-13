import styles from "@/app/home.module.css";
import { FeaturedPost } from "@/lib/types";

export function FeaturedPostCard({ post }: { post: FeaturedPost }) {
  return (
    <article className={styles.home__featuredCard}>
      <p className={styles.home__featuredLabel}>Featured</p>
      <h2 className={styles.home__featuredTitle}>{post.title}</h2>
      <p className={styles.home__featuredSummary}>{post.summary}</p>
      <div className={styles.home__metaRow}>
        <time>{post.updatedAt}</time>
        <span>{post.readingMinutes} min read</span>
      </div>
      <div className={styles.home__tagList} aria-label="featured tags">
        {post.tags.map((tag) => (
          <span key={tag} className={styles.home__tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
