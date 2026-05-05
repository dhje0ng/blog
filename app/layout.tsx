import type { Metadata, Viewport } from "next";
import siteConfig from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.blog.title,
  description: siteConfig.blog.description
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.blog.language}>
      <body>
        {children}
        <footer className="site-footer">
          <div className="container site-footer-inner">CopyRight 2026 Donghyeon Jeong</div>
        </footer>
      </body>
    </html>
  );
}
