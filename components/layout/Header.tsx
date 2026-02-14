"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_ROUTES } from "@/lib/constants/routes";
import siteConfig from "@/site.config";

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="gh-header">
      <div className="container gh-header-inner">
        <Link className="brand" href="/overview">
          {siteConfig.blog.title}
        </Link>
        <button
          type="button"
          className="gh-quickmenu-toggle"
          aria-expanded={menuOpen}
          aria-controls="quick-menu-panel"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Quick menu
        </button>
      </div>

      <nav id="quick-menu-panel" className={`gh-quickmenu-panel ${menuOpen ? "open" : ""}`} aria-label="Quick navigation">
        <div className="container gh-quickmenu-links">
          {NAV_ROUTES.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.label} className={`gh-nav-link ${isActive ? "active" : ""}`} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
