"use client";

import { useMemo, useState } from "react";

type CodeVariant = {
  language: string;
  code: string;
};

type CodeBlockTabsProps = {
  variants: CodeVariant[];
};

type TokenType = "plain" | "keyword" | "string" | "number" | "comment";

type TokenPart = {
  text: string;
  type: TokenType;
};

const KEYWORDS: Record<string, string[]> = {
  javascript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case", "break", "continue", "class", "new", "import", "from", "export", "default", "try", "catch", "finally", "throw", "await", "async", "typeof", "instanceof", "null", "true", "false"],
  typescript: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "switch", "case", "break", "continue", "class", "new", "import", "from", "export", "default", "try", "catch", "finally", "throw", "await", "async", "typeof", "instanceof", "null", "true", "false", "type", "interface", "extends", "implements", "public", "private", "protected", "readonly", "as"],
  jsx: ["const", "let", "function", "return", "if", "else", "import", "from", "export", "default"],
  tsx: ["const", "let", "function", "return", "if", "else", "import", "from", "export", "default", "type", "interface", "as"],
  python: ["def", "return", "if", "elif", "else", "for", "while", "in", "is", "not", "and", "or", "class", "import", "from", "as", "try", "except", "finally", "raise", "with", "lambda", "True", "False", "None"],
  java: ["class", "public", "private", "protected", "static", "void", "int", "long", "double", "float", "boolean", "if", "else", "for", "while", "switch", "case", "return", "new", "import", "package", "extends", "implements", "null", "true", "false"],
  c: ["int", "char", "float", "double", "void", "if", "else", "for", "while", "switch", "case", "break", "continue", "return", "struct", "typedef", "enum", "static", "const", "sizeof"],
  cpp: ["int", "char", "float", "double", "void", "if", "else", "for", "while", "switch", "case", "break", "continue", "return", "struct", "class", "namespace", "template", "typename", "using", "public", "private", "protected", "virtual", "const", "auto", "nullptr", "true", "false"],
  go: ["func", "return", "if", "else", "for", "range", "switch", "case", "break", "continue", "struct", "interface", "package", "import", "var", "const", "type", "go", "defer", "map", "chan", "true", "false", "nil"],
  rust: ["fn", "let", "mut", "if", "else", "for", "while", "loop", "match", "return", "struct", "enum", "impl", "trait", "use", "mod", "pub", "crate", "self", "super", "const", "static", "true", "false", "None", "Some"],
  bash: ["if", "then", "else", "fi", "for", "in", "do", "done", "case", "esac", "function", "return"],
  shell: ["if", "then", "else", "fi", "for", "in", "do", "done", "case", "esac", "function", "return"],
  json: ["true", "false", "null"],
  sql: ["select", "from", "where", "insert", "into", "update", "delete", "join", "left", "right", "inner", "outer", "on", "group", "by", "order", "having", "limit", "as", "and", "or", "not", "null", "create", "table", "drop", "alter", "values"]
};

const LANGUAGE_ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  sh: "bash"
};

function normalizeLanguageLabel(language: string): string {
  if (!language) return "text";
  return language.replace(/[-_]/g, " ");
}

function resolveLanguage(language: string): string {
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? normalized;
}

function splitStringSegments(text: string): Array<{ text: string; stringLiteral: boolean }> {
  const segments: Array<{ text: string; stringLiteral: boolean }> = [];
  const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), stringLiteral: false });
    }

    segments.push({ text: match[0], stringLiteral: true });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), stringLiteral: false });
  }

  return segments;
}

function findCommentIndex(text: string, markers: string[]): number {
  return markers.reduce((minIndex, marker) => {
    const index = text.indexOf(marker);
    if (index < 0) return minIndex;
    if (minIndex < 0) return index;
    return Math.min(minIndex, index);
  }, -1);
}

function highlightNonStringSegment(text: string, language: string): TokenPart[] {
  const keywords = KEYWORDS[language] ?? [];
  const keywordPattern = keywords.length ? new RegExp(`\\b(${keywords.join("|")})\\b`, language === "sql" ? "gi" : "g") : null;
  const numberPattern = /\b\d+(?:\.\d+)?\b/g;
  const tokens: TokenPart[] = [];

  const matches: Array<{ start: number; end: number; type: TokenType }> = [];

  if (keywordPattern) {
    for (const match of text.matchAll(keywordPattern)) {
      const start = match.index ?? 0;
      matches.push({ start, end: start + match[0].length, type: "keyword" });
    }
  }

  for (const match of text.matchAll(numberPattern)) {
    const start = match.index ?? 0;
    matches.push({ start, end: start + match[0].length, type: "number" });
  }

  matches.sort((a, b) => a.start - b.start || a.end - b.end);

  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    if (match.start > cursor) {
      tokens.push({ text: text.slice(cursor, match.start), type: "plain" });
    }
    tokens.push({ text: text.slice(match.start, match.end), type: match.type });
    cursor = match.end;
  }

  if (cursor < text.length) {
    tokens.push({ text: text.slice(cursor), type: "plain" });
  }

  return tokens;
}

function highlightLine(language: string, line: string): TokenPart[] {
  if (!language || language === "text") return [{ text: line, type: "plain" }];

  const commentMarkers = language === "python" || language === "bash" || language === "shell" ? ["#"] : language === "sql" ? ["--"] : ["//"];

  const tokens: TokenPart[] = [];

  splitStringSegments(line).forEach((segment) => {
    if (segment.stringLiteral) {
      tokens.push({ text: segment.text, type: "string" });
      return;
    }

    const commentIndex = findCommentIndex(segment.text, commentMarkers);

    if (commentIndex >= 0) {
      const beforeComment = segment.text.slice(0, commentIndex);
      const comment = segment.text.slice(commentIndex);
      tokens.push(...highlightNonStringSegment(beforeComment, language));
      tokens.push({ text: comment, type: "comment" });
      return;
    }

    tokens.push(...highlightNonStringSegment(segment.text, language));
  });

  return tokens.length ? tokens : [{ text: line, type: "plain" }];
}

export function CodeBlockTabs({ variants }: CodeBlockTabsProps) {
  const normalizedVariants = useMemo(
    () =>
      variants.map((variant, index) => {
        const resolvedLanguage = resolveLanguage(variant.language || "text");

        return {
          ...variant,
          language: resolvedLanguage,
          id: `${resolvedLanguage || "text"}-${index}`,
          label: normalizeLanguageLabel(resolvedLanguage || "text"),
          highlightedLines: variant.code.split("\n").map((line) => highlightLine(resolvedLanguage, line))
        };
      }),
    [variants]
  );

  const [selectedId, setSelectedId] = useState(normalizedVariants[0]?.id);
  const selectedVariant = normalizedVariants.find((variant) => variant.id === selectedId) ?? normalizedVariants[0];

  if (!selectedVariant) return null;

  return (
    <section className="post-code-block" aria-label="Code example">
      <div className="post-code-block-head">
        {normalizedVariants.length > 1 ? (
          <div className="post-code-language-tabs" role="tablist" aria-label="Code languages">
            {normalizedVariants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                role="tab"
                aria-selected={variant.id === selectedVariant.id}
                className={`post-code-language-tab${variant.id === selectedVariant.id ? " is-active" : ""}`}
                onClick={() => setSelectedId(variant.id)}
              >
                {variant.label}
              </button>
            ))}
          </div>
        ) : (
          <span className="post-code-language-badge">{selectedVariant.label}</span>
        )}
      </div>
      <pre>
        <code className={`language-${selectedVariant.language}`}>
          {selectedVariant.highlightedLines.map((line, lineIndex) => (
            <span key={`${selectedVariant.id}-line-${lineIndex}`}>
              {line.map((token, tokenIndex) => (
                <span key={`${selectedVariant.id}-line-${lineIndex}-token-${tokenIndex}`} className={`token-${token.type}`}>
                  {token.text}
                </span>
              ))}
              {lineIndex < selectedVariant.highlightedLines.length - 1 ? "\n" : ""}
            </span>
          ))}
        </code>
      </pre>
    </section>
  );
}
