"use client";

import { useEffect, useState, type ReactNode } from "react";

type Heading = {
  anchorId: string;
  level: number;
  label: ReactNode;
};

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.anchorId ?? "");

  useEffect(() => {
    const elements = headings.flatMap(({ anchorId }) => {
      const element = document.getElementById(anchorId);
      return element ? [element] : [];
    });
    let positions: { id: string; top: number }[] = [];
    let frame = 0;
    let disposed = false;

    const update = () => {
      frame = 0;
      const readingPosition = window.scrollY + 128;
      let current = positions[0]?.id ?? "";
      for (const position of positions) {
        if (position.top > readingPosition) break;
        current = position.id;
      }
      setActiveId((previous) => previous === current ? previous : current);
    };
    const measure = () => {
      if (disposed) return;
      positions = elements.map((element) => ({
        id: element.id,
        top: element.getBoundingClientRect().top + window.scrollY
      }));
      update();
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    // Cache heading positions so scrolling does not repeatedly measure the document.
    const observer = new ResizeObserver(measure);
    const article = elements[0]?.closest(".post-detail-body");
    if (article) observer.observe(article);
    measure();
    void document.fonts.ready.then(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.cancelAnimationFrame(frame);
    };
  }, [headings]);

  return (
    <nav className="post-toc" aria-label="글 목차">
      <h2>이 글의 목차</h2>
      <ol>
        {headings.map((heading) => (
          <li key={heading.anchorId} className={`post-toc-depth-${heading.level}`}>
            <a href={`#${heading.anchorId}`} aria-current={activeId === heading.anchorId ? "location" : undefined}>
              <span className="post-toc-node" aria-hidden="true" />
              <span className="post-toc-label">{heading.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
