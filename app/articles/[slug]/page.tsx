import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { CodeBlockTabs } from "@/components/post/CodeBlockTabs";
import { getPostBySlugOrNull } from "@/lib/notion/safe";

export const revalidate = 900;

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugOrNull(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: `${post.title} | N-Blog`,
    description: post.summary
  };
}

export default async function ArticleDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlugOrNull(slug);

  if (!post) {
    notFound();
  }

  const renderInlineMarkdown = (text: string): ReactNode[] => {
    let nodeKey = 0;

    const parse = (input: string): ReactNode[] => {
      const nodes: ReactNode[] = [];
      let plainTextBuffer = "";
      let cursor = 0;

      const pushBufferedText = () => {
        if (!plainTextBuffer) return;
        nodes.push(plainTextBuffer);
        plainTextBuffer = "";
      };

      const findClosingDelimiter = (start: number, delimiter: string) => {
        let position = start;

        while (position < input.length) {
          const foundIndex = input.indexOf(delimiter, position);

          if (foundIndex === -1) return -1;
          if (input[foundIndex - 1] !== "\\") return foundIndex;

          position = foundIndex + delimiter.length;
        }

        return -1;
      };

      const consumeLink = () => {
        const labelStart = cursor + 1;
        const labelEnd = input.indexOf("]", labelStart);

        if (labelEnd === -1 || input[labelEnd + 1] !== "(") return false;

        const urlStart = labelEnd + 2;
        const urlEnd = input.indexOf(")", urlStart);

        if (urlEnd === -1) return false;

        const label = input.slice(labelStart, labelEnd);
        const href = input.slice(urlStart, urlEnd).trim();

        if (!/^https?:\/\//.test(href)) return false;

        pushBufferedText();
        nodeKey += 1;
        nodes.push(
          <Link key={`inline-link-${nodeKey}`} href={href} target="_blank" rel="noreferrer noopener">
            {parse(label)}
          </Link>
        );
        cursor = urlEnd + 1;
        return true;
      };

      while (cursor < input.length) {
        if (input[cursor] === "[" && consumeLink()) {
          continue;
        }

        if (input.startsWith("`", cursor)) {
          const closing = findClosingDelimiter(cursor + 1, "`");

          if (closing !== -1) {
            pushBufferedText();
            nodeKey += 1;
            nodes.push(<code key={`inline-code-${nodeKey}`}>{input.slice(cursor + 1, closing)}</code>);
            cursor = closing + 1;
            continue;
          }
        }

        if (input.startsWith("**", cursor) || input.startsWith("__", cursor)) {
          const delimiter = input.slice(cursor, cursor + 2);
          const closing = findClosingDelimiter(cursor + 2, delimiter);

          if (closing !== -1) {
            pushBufferedText();
            nodeKey += 1;
            nodes.push(<strong key={`inline-strong-${nodeKey}`}>{parse(input.slice(cursor + 2, closing))}</strong>);
            cursor = closing + 2;
            continue;
          }
        }

        if (input.startsWith("~~", cursor)) {
          const closing = findClosingDelimiter(cursor + 2, "~~");

          if (closing !== -1) {
            pushBufferedText();
            nodeKey += 1;
            nodes.push(<del key={`inline-del-${nodeKey}`}>{parse(input.slice(cursor + 2, closing))}</del>);
            cursor = closing + 2;
            continue;
          }
        }

        plainTextBuffer += input[cursor];
        cursor += 1;
      }

      pushBufferedText();
      return nodes;
    };

    return parse(text);
  };

  const markdownSource = post.content ?? post.summary;
  const rawLines = markdownSource.split("\n");
  const contentBlocks: Array<
    | { id: string; type: "image"; src: string; alt: string }
    | { id: string; type: "paragraph"; text: string }
    | { id: string; type: "heading"; text: string; level: number; anchorId: string }
    | { id: string; type: "code"; variants: Array<{ language: string; code: string }> }
  > = [];

  let lineIndex = 0;

  while (lineIndex < rawLines.length) {
    const currentLine = rawLines[lineIndex];
    const trimmedLine = currentLine.trim();

    if (!trimmedLine) {
      lineIndex += 1;
      continue;
    }

    const codeFenceMatch = trimmedLine.match(/^```([^`]*)$/);

    if (codeFenceMatch) {
      const codeVariants: Array<{ language: string; code: string }> = [];
      let cursor = lineIndex;

      while (cursor < rawLines.length) {
        const openFenceMatch = rawLines[cursor].trim().match(/^```([^`]*)$/);

        if (!openFenceMatch) break;

        const language = openFenceMatch[1].trim().toLowerCase() || "text";
        cursor += 1;
        const codeLines: string[] = [];

        while (cursor < rawLines.length && !rawLines[cursor].trim().match(/^```$/)) {
          codeLines.push(rawLines[cursor]);
          cursor += 1;
        }

        if (cursor < rawLines.length && rawLines[cursor].trim() === "```") {
          cursor += 1;
        }

        codeVariants.push({ language, code: codeLines.join("\n") });

        while (cursor < rawLines.length && !rawLines[cursor].trim()) {
          cursor += 1;
        }

        if (!rawLines[cursor]?.trim().match(/^```([^`]*)$/)) {
          break;
        }
      }

      if (codeVariants.length) {
        contentBlocks.push({
          id: `${post.id}-code-${lineIndex}`,
          type: "code",
          variants: codeVariants
        });
      }

      lineIndex = cursor;
      continue;
    }

    const markdownImageMatch = trimmedLine.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);

    if (markdownImageMatch) {
      contentBlocks.push({
        id: `${post.id}-image-${lineIndex}`,
        type: "image",
        src: markdownImageMatch[2],
        alt: markdownImageMatch[1] || post.title
      });
      lineIndex += 1;
      continue;
    }

    const plainImageUrlMatch = trimmedLine.match(/^(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg)(?:\?\S*)?)$/i);

    if (plainImageUrlMatch) {
      contentBlocks.push({
        id: `${post.id}-image-${lineIndex}`,
        type: "image",
        src: plainImageUrlMatch[1],
        alt: post.title
      });
      lineIndex += 1;
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,3})\s+(.+)$/);

    if (!headingMatch) {
      contentBlocks.push({ id: `${post.id}-paragraph-${lineIndex}`, type: "paragraph", text: trimmedLine });
      lineIndex += 1;
      continue;
    }

    const level = Math.min(headingMatch[1].length, 3);
    const text = headingMatch[2];
    const anchorId = `${post.slug}-toc-${text
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")}`;

    contentBlocks.push({
      id: `${post.id}-heading-${lineIndex}`,
      type: "heading",
      text,
      level,
      anchorId
    });

    lineIndex += 1;
  }

  const tableOfContents = contentBlocks.filter((block): block is Extract<(typeof contentBlocks)[number], { type: "heading" }> => block.type === "heading");

  return (
    <main>
      <Header />
      <article className="post-detail-wrap mobile-viewer-page mobile-viewer-detail">
        <div className="post-detail-head container-narrow">
          <p className="post-detail-kicker">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="post-detail-summary">{post.summary}</p>
          <div className="post-detail-meta">
            <span>{post.author}</span>
            <span>·</span>
            <time>{post.updateAt}</time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>

        {post.thumbnail ? (
          <div className="post-detail-cover-wrap container-narrow">
            <div className="post-detail-cover" style={{ backgroundImage: `url(${post.thumbnail})` }} aria-hidden="true" />
          </div>
        ) : null}

        <div className="post-detail-content-grid container-narrow">
          <div className="post-detail-body">
            {contentBlocks.map((block) => {
              if (block.type === "heading") {
                if (block.level === 1) {
                  return (
                    <h2 key={block.id} id={block.anchorId}>
                      {renderInlineMarkdown(block.text)}
                    </h2>
                  );
                }

                if (block.level === 2) {
                  return (
                    <h3 key={block.id} id={block.anchorId}>
                      {renderInlineMarkdown(block.text)}
                    </h3>
                  );
                }

                return (
                  <h4 key={block.id} id={block.anchorId}>
                    {renderInlineMarkdown(block.text)}
                  </h4>
                );
              }

              if (block.type === "image") {
                return (
                  <figure key={block.id} className="post-detail-inline-image-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={block.src} alt={block.alt} className="post-detail-inline-image" loading="lazy" />
                  </figure>
                );
              }

              if (block.type === "code") {
                return <CodeBlockTabs key={block.id} variants={block.variants} />;
              }

              return <p key={block.id}>{renderInlineMarkdown(block.text)}</p>;
            })}
            {!!post.tags.length && (
              <ul className="post-tag-list" aria-label="post tags">
                {post.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </div>

          {!!tableOfContents.length && (
            <aside className="post-toc-sidebar" aria-label="Table of Contents">
              <section className="post-toc">
                <h2>Table of Contents</h2>
                <ol>
                  {tableOfContents.map((heading) => (
                    <li key={heading.id} className={`post-toc-depth-${heading.level}`}>
                      <a href={`#${heading.anchorId}`}>{renderInlineMarkdown(heading.text)}</a>
                    </li>
                  ))}
                </ol>
              </section>
            </aside>
          )}
        </div>
      </article>
    </main>
  );
}
