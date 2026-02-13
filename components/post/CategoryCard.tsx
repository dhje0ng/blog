import { CategorySummary } from "@/lib/types";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <article className="category-card">
      <p className="category-name">#{category.name}</p>
      <h3>{category.representativePost.title}</h3>
      <p>{category.representativePost.summary}</p>
      <div className="post-meta-row">
        <time>{category.representativePost.updatedAt}</time>
        <span>{category.postCount} posts</span>
      </div>
    </article>
  );
}
