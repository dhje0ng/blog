export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: "public" | "private";
  date: string;
  updateAt: string;
  summary: string;
  tags: string[];
  category: string;
  readingMinutes: number;
  thumbnail?: string;
  content?: string;
};

export type CategorySummary = {
  name: string;
  slug: string;
  count: number;
  description: string;
};
