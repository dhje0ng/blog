"use client";

import { useMemo, useState } from "react";
import { PostListItem } from "@/components/post/PostListItem";
import type { PostSummary } from "@/lib/models/post";

type ArticlesSearchClientProps = {
  posts: PostSummary[];
  initialQuery: string;
};

function includesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function ArticlesSearchClient({ posts, initialQuery }: ArticlesSearchClientProps) {
  const [query, setQuery] = useState(initialQuery);

  const filteredPosts = useMemo(() => {
    if (!query.trim()) {
      return posts;
    }

    return posts.filter((post) => includesQuery(`${post.title} ${post.summary} ${post.tags.join(" ")} ${post.category}`, query));
  }, [posts, query]);

  return (
    <>
      <div className="articles-search">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="아티클 검색 (제목, 요약, 태그)"
          aria-label="Search articles"
        />
      </div>

      {query.trim() ? <p className="search-result-meta">&quot;{query.trim()}&quot; 검색 결과: {filteredPosts.length}개</p> : null}

      <div className="list-layout">
        {filteredPosts.map((post) => (
          <PostListItem key={post.id} post={post} />
        ))}
      </div>
    </>
  );
}
