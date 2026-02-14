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
            🗺️
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
