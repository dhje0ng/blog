export function Hero() {
  return (
    <section className="hero container">
      <p className="eyebrow">Editorial Prototype</p>
      <h1>기록이 곧 컬렉션이 되는 블로그</h1>
      <p className="hero-copy">
        Overview에서 흐름을 읽고, Collection에서 주제를 탐색하고, Articles에서 모든 글을 만나는
        구조로 설계했습니다. 화이트톤과 여백 중심의 레이아웃으로 읽기 경험을 강화합니다.
      </p>
      <div className="hero-meta">
        <span className="meta-pill">Overview</span>
        <span className="meta-pill">Collection</span>
        <span className="meta-pill">Articles</span>
      </div>
    </section>
  );
}
