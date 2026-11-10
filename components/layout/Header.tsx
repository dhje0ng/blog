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
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // Theme switching still works when browser storage is unavailable.
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    setShareMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: "JDH 블로그 홈페이지를 공유합니다.",
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
