"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./Header.module.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" }
] as const;

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.header__inner}`}>
        <Link className={styles.header__brand} href="/" aria-label="Go to homepage">
          N-Blog
        </Link>

        <button
          type="button"
          className={styles.header__menuButton}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span aria-hidden="true">☰</span>
          <span className={styles.header__srOnly}>Toggle menu</span>
        </button>

        <nav
          id="main-navigation"
          className={`${styles.header__nav} ${isMenuOpen ? styles.header__navOpen : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <a
                key={item.href}
                className={`${styles.header__link} ${isActive ? styles.header__linkActive : ""}`}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className={styles.header__utils}>
          <button type="button" className={styles.header__utilButton} aria-label="Search">
            🔍
          </button>
          <button type="button" className={styles.header__utilButton} aria-label="Toggle theme">
            🌓
          </button>
        </div>
      </div>

      <div
        className={`${styles.header__dim} ${isMenuOpen ? styles.header__dimOpen : ""}`}
        aria-hidden="true"
        onClick={() => setIsMenuOpen(false)}
      />
    </header>
  );
}
