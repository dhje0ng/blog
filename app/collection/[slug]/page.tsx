import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getPosts } from "@/lib/notion";

function slugifyCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const posts = await getPosts();
  const categorySlugs = [...new Set(posts.map((post) => slugifyCategory(post.category ?? "Uncategorized")))];
  return categorySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const posts = await getPosts();
  const categoryName = posts.find((post) => slugifyCategory(post.category ?? "Uncategorized") === params.slug)?.category;

  if (!categoryName) {
    return { title: "Collection not found" };
  }

  return {
    title: `${categoryName} Collection | N-Blog`,
    description: `${categoryName} 카테고리의 게시글 목록`
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const posts = await getPosts();
  const filteredPosts = posts.filter((post) => slugifyCategory(post.category ?? "Uncategorized") === params.slug);

  if (!filteredPosts.length) {
    notFound();
  }

  const categoryName = filteredPosts[0].category ?? "Uncategorized";

  return (
    <main>
      <Header />
      <section className="container section-gap top-gap">
        <div className="collection-head">
          <Link href="/collection" className="collection-back-link">
            ← Collection
          </Link>
          <h1>{categoryName}</h1>
          <p>{filteredPosts.length}개의 아티클</p>
        </div>

        <div className="list-layout">
          {filteredPosts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
