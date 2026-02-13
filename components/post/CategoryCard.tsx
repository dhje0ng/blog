import type { Route } from "next";
import Link from "next/link";
import { CategorySummary, PostSummary } from "@/lib/models/post";

type CategoryCardProps = {
  category: CategorySummary;
  posts: PostSummary[];
};

export function CategoryCard({ category, posts }: CategoryCardProps) {
  return (
    <article className="category-card">
      <Link href={`/collection/${category.slug}` as Route} className="category-card-title">
        <h3>{category.name}</h3>
      </Link>
      <p>{category.description}</p>
      <ul className="category-preview-list" aria-label={`${category.name} preview posts`}>
        {posts.slice(0, 3).map((post) => (
          <li key={post.id}>
            <Link href={`/articles/${post.slug}` as Route}>{post.title}</Link>
          </li>
        ))}
      </ul>
      <Link className="category-more-link" href={`/collection/${category.slug}` as Route}>
        {category.count} Articles 보기
      </Link>
    </article>
  );
}
