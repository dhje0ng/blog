export default function Loading() {
  return (
    <main className="container top-gap section-gap" role="status" aria-label="페이지를 불러오는 중">
      <span className="sr-only">페이지를 불러오는 중입니다.</span>
      <div className="loading-placeholder" aria-hidden="true">
        <div className="loading-title" />
        {[0, 1, 2].map((item) => <div key={item} className="loading-row" />)}
      </div>
    </main>
  );
}
