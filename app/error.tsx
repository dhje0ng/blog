"use client";

import Image from "next/image";

const CAT_GIF_URL = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2s1OW05c2s2M2FveDk0M3R5enFlMzRiMjByMmFlbTZ5djFmbWRxYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <main className="error-page">
          <Image className="error-cat-gif" src={CAT_GIF_URL} alt="cat gif" width={360} height={240} unoptimized />
          <h1>Internal Server Error</h1>
          <button type="button" onClick={() => reset()}>
            Retry
          </button>
        </main>
      </body>
    </html>
  );
}
