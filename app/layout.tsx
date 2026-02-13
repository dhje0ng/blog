import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notion GitHub Blog Prototype",
  description: "Next.js + Notion 기반의 화이트톤 GitHub 스타일 블로그 프로토타입"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
