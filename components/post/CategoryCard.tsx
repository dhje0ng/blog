import { CategorySummary } from "@/lib/types";

export function CategoryCard({ category }: { category: CategorySummary }) {
  return (
    <article className="category-card">
      <h3>{category.name}</h3>
      <p>{category.description}</p>
      <span>{category.count} Articles</span>
    </article>
  );
}
