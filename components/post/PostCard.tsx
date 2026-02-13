import { PostSummary } from "@/lib/models/post";
import { PostListItem } from "@/components/post/PostListItem";

export function PostCard({ post }: { post: PostSummary }) {
  return <PostListItem post={post} />;
}
