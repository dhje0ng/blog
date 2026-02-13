export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  updatedAt: string;
  readingMinutes: number;
  coverImage?: string;
  category?: string;
  author?: string;
};

export type FeaturedPost = PostSummary;

export type PostListItem = PostSummary;

export type CategorySummary = {
  name: string;
  postCount: number;
  representativePost: PostSummary;
};
