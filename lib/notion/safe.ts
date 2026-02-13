import { getPostBySlug, getPosts, isNotionDatabaseUnavailableError } from "@/lib/notion/posts";
import type { PostSummary } from "@/lib/models/post";

export async function getPostsOrNull(): Promise<PostSummary[] | null> {
  try {
    return await getPosts();
  } catch (error) {
    if (isNotionDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}

export async function getPostBySlugOrNull(slug: string): Promise<PostSummary | null> {
  try {
    return await getPostBySlug(slug);
  } catch (error) {
    if (isNotionDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}
