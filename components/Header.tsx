"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="gh-header">
      <div className="container gh-header-inner">
        <Link className="brand" href="/" aria-label="Go to homepage">
          N-Blog
        </Link>

        <button
          type="button"
          className="gh-menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span aria-hidden="true">☰</span>
          <span className="sr-only">Toggle menu</span>
        </button>

        <nav
          id="main-navigation"
          className={`gh-nav ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                className={`gh-nav-link ${isActive ? "is-active" : ""}`}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="gh-header-utils">
          <button type="button" className="gh-util-button" aria-label="Search">
            🔍
          </button>
          <button type="button" className="gh-util-button" aria-label="Toggle theme">
            🌓
          </button>
        </div>
      </div>

      <div
        className={`gh-nav-dim ${isMenuOpen ? "is-open" : ""}`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
