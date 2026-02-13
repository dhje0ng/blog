export function Hero() {
  return (
    <section className="hero container">
      <p className="eyebrow">Overview</p>
      <h1>기술과 기록, 일상적인 발견을 차분하게 정리하는 공간</h1>
      <p className="hero-copy">
        긴 문장을 읽기 편한 여백과 타이포로 구성하고, 핵심 글은 상단에 큐레이션했습니다.
        아래에서 최신 글과 카테고리별 아카이브를 이어서 탐색할 수 있습니다.
      </p>
      <div className="hero-meta">
        <span className="meta-pill">Editor&apos;s Pick</span>
        <span className="meta-pill">Quick Reads</span>
        <span className="meta-pill">Archive</span>
      </div>
    </section>
  );
}
