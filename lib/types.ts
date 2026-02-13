export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  category: string;
  updatedAt: string;
  readingMinutes: number;
  coverImage?: string;
};

export type CategorySummary = {
  name: string;
  count: number;
  description: string;
};
