"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/overview" },
  { label: "Collection", href: "/collection" },
  { label: "Articles", href: "/articles" }
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="gh-header">
      <div className="container gh-header-inner">
        <Link className="brand" href="/overview">
          N-Blog
        </Link>
        <nav className="gh-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} className={`gh-nav-link ${isActive ? "active" : ""}`} href={item.href}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
