import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PostCard } from "@/components/PostCard";
import { CategoryCard } from "@/components/post/CategoryCard";
import { FeaturedPostCard } from "@/components/post/FeaturedPostCard";
import { getPosts } from "@/lib/notion";
import { CategorySummary, FeaturedPost, PostListItem as PostListItemType } from "@/lib/types";
import styles from "./home.module.css";

function toCategorySummaries(posts: PostListItemType[]): CategorySummary[] {
  const map = new Map<string, { postCount: number; representativePost: PostListItemType }>();

  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      const existing = map.get(tag);
      if (existing) {
        map.set(tag, { ...existing, postCount: existing.postCount + 1 });
        return;
      }
      map.set(tag, { postCount: 1, representativePost: post });
    });
  });

  return Array.from(map.entries())
    .map(([name, value]) => ({
      name,
      postCount: value.postCount,
      representativePost: value.representativePost
    }))
    .slice(0, 4);
}

export default async function HomePage() {
  const posts = await getPosts();
  const featuredPost: FeaturedPost | undefined = posts[0];
  const postList: PostListItemType[] = posts.slice(1);
  const categorySummaries = toCategorySummaries(posts);

  return (
    <main>
      <Header />
      <Hero />

      {featuredPost && (
        <section className={`container ${styles.home__section}`} aria-label="featured post">
          <div className={styles.home__sectionTitleRow}>
            <h3>Featured Post</h3>
          </div>
          <FeaturedPostCard post={featuredPost} />
        </section>
      )}

      <section className={`container ${styles.home__section}`} aria-label="latest posts">
        <div className={styles.home__sectionTitleRow}>
          <h3>Latest Posts</h3>
          <button type="button" className={styles.home__ghostButton}>
            View all
          </button>
        </div>
        <div className={styles.home__postListGrid}>
          {postList.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className={`container ${styles.home__section}`} aria-label="category highlights">
        <div className={styles.home__sectionTitleRow}>
          <h3>Category Highlights</h3>
        </div>
        <div className={styles.home__categoryGrid}>
          {categorySummaries.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </section>
    </main>
  );
}
