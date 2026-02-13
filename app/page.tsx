import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PostCard } from "@/components/PostCard";
import { getPosts } from "@/lib/notion";

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <main>
      <Header />
      <Hero />
      <section className="container section-gap" aria-label="posts">
        <div className="section-title-row">
          <h3>Latest Posts</h3>
          <button type="button" className="ghost-button">
            View all
          </button>
        </div>
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
