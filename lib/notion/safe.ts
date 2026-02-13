import { getPostBySlug, getPosts, isNotionDatabaseUnavailableError } from "@/lib/notion/posts";
import type { PostSummary } from "@/lib/models/post";

export async function getPostsOrNull(): Promise<PostSummary[] | null> {
  try {
    return await getPosts();
  } catch (error) {
    console.log("[Notion Debug] getPostsOrNull failed", {
      error: error instanceof Error ? error.message : error
    });

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
    console.log("[Notion Debug] getPostBySlugOrNull failed", {
      slug,
      error: error instanceof Error ? error.message : error
    });

    if (isNotionDatabaseUnavailableError(error)) {
      return null;
    }

    throw error;
  }
}
