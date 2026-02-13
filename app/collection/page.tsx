import { Header } from "@/components/Header";
import { CategoryCard } from "@/components/post/CategoryCard";
import { getPosts } from "@/lib/notion";
import { CategorySummary } from "@/lib/types";

function toCategorySummaries(posts: Awaited<ReturnType<typeof getPosts>>): CategorySummary[] {
  const categoryMap = posts.reduce<Map<string, number>>((acc, post) => {
    const category = post.category ?? "Uncategorized";
    acc.set(category, (acc.get(category) ?? 0) + 1);
    return acc;
  }, new Map());

  return [...categoryMap.entries()]
    .map(([name, count]) => ({
      name,
      count,
      description: `${name} 주제의 아티클 ${count}개`
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function CollectionPage() {
  const posts = await getPosts();
  const categories = toCategorySummaries(posts);

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap">
        <div className="section-title-row">
          <h1>Collection</h1>
          <p>주제별로 분류된 아티클 컬렉션입니다.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </section>
    </main>
  );
}
