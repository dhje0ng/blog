"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import siteConfig from "@/site.config";

const THEME_KEY = "n-blog-theme";
const THEME_CHANGE_EVENT = "n-blog-theme-change";

type ThemeMode = "light" | "dark";

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot(): ThemeMode {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): ThemeMode {
  return "light";
}

export function Header() {
  const pathname = usePathname();
  // Theme lives on <html data-theme> (set pre-paint by the layout's inline script).
  // useSyncExternalStore reads it without an effect, avoiding cascading renders and FOUC.
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!shareMessage) {
      return;
    }

    const timer = window.setTimeout(() => setShareMessage(""), 1600);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  const handleThemeToggle = () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    localStorage.setItem(THEME_KEY, nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
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
        <Link className="brand" href="/">
          {siteConfig.blog.title}
        </Link>

        <nav className="header-nav" aria-label="주 메뉴">
          <Link href="/" aria-current={(pathname === "/" || pathname === "/overview") ? "page" : undefined}>Blog</Link>
          <Link href="/collection" aria-current={pathname.startsWith("/collection") ? "page" : undefined}>Collection</Link>
          {/* Full document navigation leaves the blog base path. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">Portfolio ↗</a>
        </nav>
        <div className="gh-header-tools">
          <a href="/blog/sitemap.xml" className="gh-icon-button" target="_blank" rel="noreferrer" aria-label="sitemap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15 4.5L9 2L3 4.5v17L9 19l6 2.5l6-2.5v-17zM9.75 3.61l4.5 1.88v14.9l-4.5-1.88zM4.5 5.49L8.25 3.93v14.9L4.5 20.4zm15 12.51l-3.75 1.56V4.66l3.75-1.56z"
              />
            </svg>
          </a>
          <a href="/blog/rss.xml" className="gh-icon-button" target="_blank" rel="noreferrer" aria-label="rss feed">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6.18 15.64a2.18 2.18 0 1 0 0 4.36a2.18 2.18 0 0 0 0-4.36M4 9.06v3.27a7.67 7.67 0 0 1 7.67 7.67h3.27C14.94 13.98 10.02 9.06 4 9.06M4 4v3.27C11.83 7.27 18.73 14.17 18.73 22H22C22 12.38 13.62 4 4 4"
              />
            </svg>
          </a>
          <button type="button" className="gh-icon-button" onClick={handleShare} aria-label="share page">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l2-2" /></svg>
          </button>
          <button type="button" className="gh-icon-button" onClick={handleThemeToggle} aria-label="toggle color theme">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{theme === "light" ? <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" /></>}</svg>
          </button>
        </div>
      </div>
      {shareMessage ? <p className="gh-share-feedback">{shareMessage}</p> : null}
    </header>
  );
}
