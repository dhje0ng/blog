"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import siteConfig from "@/site.config";

const THEME_KEY = "n-blog-theme";

type ThemeMode = "light" | "dark";

export function Header() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const nextTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    if (!shareMessage) {
      return;
    }

    const timer = window.setTimeout(() => setShareMessage(""), 1600);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleShare = async () => {
    const url = window.location.href;
    setShareMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: "N-Blog 페이지를 공유합니다.",
          url
        });
        setShareMessage("공유 완료");
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("링크 복사됨");
    } catch {
      setShareMessage("공유 실패");
    }
  };

  return (
    <header className="gh-header">
      <div className="gh-header-inner">
        <Link className="brand" href="/overview">
          {siteConfig.blog.title}
        </Link>

        <div className="gh-header-tools">
          <a href="/sitemap.xml" className="gh-icon-button" target="_blank" rel="noreferrer" aria-label="sitemap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15 4.5L9 2L3 4.5v17L9 19l6 2.5l6-2.5v-17zM9.75 3.61l4.5 1.88v14.9l-4.5-1.88zM4.5 5.49L8.25 3.93v14.9L4.5 20.4zm15 12.51l-3.75 1.56V4.66l3.75-1.56z"
              />
            </svg>
          </a>
          <a href="/rss.xml" className="gh-icon-button" target="_blank" rel="noreferrer" aria-label="rss feed">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.18 15.64a2.18 2.18 0 1 0 0 4.36a2.18 2.18 0 0 0 0-4.36M4 9.06v3.27a7.67 7.67 0 0 1 7.67 7.67h3.27C14.94 13.98 10.02 9.06 4 9.06M4 4v3.27C11.83 7.27 18.73 14.17 18.73 22H22C22 12.38 13.62 4 4 4"
              />
            </svg>
          </a>
          <button type="button" className="gh-icon-button" onClick={handleShare} aria-label="share page">
            🔗
          </button>
          <button type="button" className="gh-icon-button" onClick={handleThemeToggle} aria-label="toggle color theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
      {shareMessage ? <p className="gh-share-feedback">{shareMessage}</p> : null}
    </header>
  );
}
