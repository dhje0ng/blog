"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <main className="error-page">
          <h1>Internal Server Error</h1>
          <p>노션 API에서 게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
          <button type="button" onClick={() => reset()}>
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
