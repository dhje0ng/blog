import type { Route } from "next";

export const NAV_ROUTES: Array<{ label: string; href: Route }> = [
  { label: "overview", href: "/overview" },
  { label: "collection", href: "/collection" },
  { label: "article", href: "/articles" }
];

export const DEFAULT_ROUTE: Route = "/overview";
