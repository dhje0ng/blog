import { getPostBySlug, getPosts, isNotionDatabaseUnavailableError } from "@/lib/notion/posts";
import type { PostSummary } from "@/lib/models/post";
import { FALLBACK_POSTS } from "@/lib/notion/fallback";

export async function getPostsOrNull(): Promise<PostSummary[] | null> {
  try {
    return await getPosts();
  } catch (error) {
    if (isNotionDatabaseUnavailableError(error)) {
      return FALLBACK_POSTS;
    }

    throw error;
  }
}

export async function getPostBySlugOrNull(slug: string): Promise<PostSummary | null> {
  try {
    return await getPostBySlug(slug);
  } catch (error) {
    if (isNotionDatabaseUnavailableError(error)) {
      return FALLBACK_POSTS.find((post) => post.slug === slug) ?? null;
    }

    throw error;
  }
}
