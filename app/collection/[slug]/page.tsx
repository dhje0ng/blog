import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PostListItem } from "@/components/post/PostListItem";
import { getCategorySlug } from "@/lib/notion/posts";
import { getPostsOrNull } from "@/lib/notion/safe";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const posts = await getPostsOrNull();

  if (!posts) {
    return { title: "Not found" };
  }

  const categoryName = posts.find((post) => getCategorySlug(post.category) === params.slug)?.category;

  if (!categoryName) {
    return { title: "Collection not found" };
  }

  return {
    title: `${categoryName} Collection | N-Blog`,
    description: `${categoryName} 카테고리의 게시글 목록`
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const posts = await getPostsOrNull();

  if (!posts) {
    notFound();
  }

  const filteredPosts = posts.filter((post) => getCategorySlug(post.category) === params.slug);

  if (!filteredPosts.length) {
    notFound();
  }

  const categoryName = filteredPosts[0].category;

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
