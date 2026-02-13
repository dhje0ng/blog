export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  updatedAt: string;
  readingMinutes: number;
};

export type FeaturedPost = PostSummary;

export type PostListItem = PostSummary;

export type CategorySummary = {
  name: string;
  postCount: number;
  representativePost: PostSummary;
};
