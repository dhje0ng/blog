import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { CategoryCard } from "@/components/post/CategoryCard";
import { getCategorySlug } from "@/lib/notion/posts";
import { getPostsOrNull } from "@/lib/notion/safe";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const posts = await getPostsOrNull();

  if (!posts) {
    notFound();
  }

  const grouped = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const key = post.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {});

  const categories = Object.entries(grouped)
    .map(([name, categoryPosts]) => ({
      name,
      slug: getCategorySlug(name),
      count: categoryPosts.length,
      description: `${name} 주제의 아티클 ${categoryPosts.length}개`,
      posts: categoryPosts
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap">
        <div className="section-title-row">
          <h1>Collection</h1>
          <p>카테고리별 글 묶음과 대표 게시글을 한 번에 확인할 수 있습니다.</p>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} posts={category.posts} />
          ))}
        </div>
      </section>
    </main>
  );
}
