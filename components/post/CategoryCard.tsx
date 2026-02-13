import styles from "@/app/home.module.css";
import { CategorySummary } from "@/lib/types";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <article className={styles.home__categoryCard}>
      <p className={styles.home__categoryName}>#{category.name}</p>
      <h3 className={styles.home__categoryTitle}>{category.representativePost.title}</h3>
      <p className={styles.home__categorySummary}>{category.representativePost.summary}</p>
      <div className={styles.home__metaRow}>
        <time>{category.representativePost.updatedAt}</time>
        <span>{category.postCount} posts</span>
      </div>
    </article>
  );
}
