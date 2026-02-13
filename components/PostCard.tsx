import { PostListItem } from "@/components/post/PostListItem";
import { PostSummary } from "@/lib/types";

export function PostCard({ post }: { post: PostSummary }) {
  return <PostListItem post={post} />;
}
