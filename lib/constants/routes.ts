import type { Route } from "next";

export const NAV_ROUTES: Array<{ label: string; href: Route }> = [
  { label: "Overview", href: "/overview" },
  { label: "Collection", href: "/collection" },
  { label: "Articles", href: "/articles" }
];

export const DEFAULT_ROUTE: Route = "/overview";
