"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ROUTES } from "@/lib/constants/routes";
import siteConfig from "@/site.config";

const THEME_KEY = "n-blog-theme";

type ThemeMode = "light" | "dark";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
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

  const closeMenu = () => setMenuOpen(false);

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
      <div className="container gh-header-inner">
        <Link className="brand" href="/overview">
          {siteConfig.blog.title}
        </Link>

        <div className="gh-header-tools">
          <button
            type="button"
            className="gh-quickmenu-search"
            aria-expanded={menuOpen}
            aria-controls="quick-menu-modal"
            onClick={() => setMenuOpen(true)}
          >
            <span aria-hidden="true">🔎</span>
            <span>Quick menu</span>
          </button>

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

      <div className={`gh-quickmenu-backdrop ${menuOpen ? "open" : ""}`} onClick={closeMenu} aria-hidden={!menuOpen} />
      <aside id="quick-menu-modal" className={`gh-quickmenu-modal ${menuOpen ? "open" : ""}`} aria-label="Quick navigation">
        <div className="gh-quickmenu-panel">
          <div className="gh-quickmenu-modal-head">
            <strong>Quick menu</strong>
            <button type="button" className="gh-modal-close" onClick={closeMenu} aria-label="close quick menu">
              ✕
            </button>
          </div>
          <nav className="gh-quickmenu-links">
            {NAV_ROUTES.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.label} className={`gh-nav-link ${isActive ? "active" : ""}`} href={item.href} onClick={closeMenu}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      {shareMessage ? <p className="gh-share-feedback">{shareMessage}</p> : null}
    </header>
  );
}
