import { Header } from "@/components/Header";
import { CategoryCard } from "@/components/post/CategoryCard";
import { getCategorySummaries } from "@/lib/notion";

export default async function CollectionPage() {
  const categories = await getCategorySummaries();

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
