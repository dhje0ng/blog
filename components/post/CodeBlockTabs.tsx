"use client";

import { useMemo, useState } from "react";

type CodeVariant = {
  language: string;
  code: string;
};

type CodeBlockTabsProps = {
  variants: CodeVariant[];
};

function normalizeLanguageLabel(language: string): string {
  if (!language) return "text";
  return language.replace(/[-_]/g, " ");
}

export function CodeBlockTabs({ variants }: CodeBlockTabsProps) {
  const normalizedVariants = useMemo(
    () =>
      variants.map((variant, index) => ({
        ...variant,
        id: `${variant.language || "text"}-${index}`,
        label: normalizeLanguageLabel(variant.language || "text")
      })),
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
        <code>{selectedVariant.code}</code>
      </pre>
    </section>
  );
}
