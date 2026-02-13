export function Hero() {
  return (
    <section className="hero container">
      <p className="eyebrow">Prototype v0.1</p>
      <h1>Next.js + Notion 기반의 GitHub 스타일 블로그</h1>
      <p className="hero-copy">
        화이트톤 중심의 미니멀 디자인과 반응형 레이아웃을 적용한 1차 프로토타입입니다.
        실제 Notion DB 연결 시 자동으로 포스트 목록을 동기화합니다.
      </p>
      <div className="hero-meta">
        <span className="meta-pill">Responsive</span>
        <span className="meta-pill">GitHub-inspired</span>
        <span className="meta-pill">Notion Sync Ready</span>
      </div>
    </section>
  );
}
