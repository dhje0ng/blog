import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={`container ${styles.hero}`}>
      <p className={styles.hero__eyebrow}>Prototype v0.1</p>
      <h1 className={styles.hero__title}>Next.js + Notion 기반의 GitHub 스타일 블로그</h1>
      <p className={styles.hero__copy}>
        화이트톤 중심의 미니멀 디자인과 반응형 레이아웃을 적용한 1차 프로토타입입니다. 실제 Notion DB 연결
        시 자동으로 포스트 목록을 동기화합니다.
      </p>
      <div className={styles.hero__meta}>
        <span className={styles.hero__pill}>Responsive</span>
        <span className={styles.hero__pill}>GitHub-inspired</span>
        <span className={styles.hero__pill}>Notion Sync Ready</span>
      </div>
    </section>
  );
}
