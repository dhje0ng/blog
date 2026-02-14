import type { Metadata } from "next";
import siteConfig from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.blog.title,
  description: siteConfig.blog.description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.blog.language}>
      <body>{children}</body>
    </html>
  );
}
