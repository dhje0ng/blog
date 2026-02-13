import Image from "next/image";

const CAT_GIF_URL = "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif";

export default function NotFoundPage() {
  return (
    <main className="error-page">
      <Image className="error-cat-gif" src={CAT_GIF_URL} alt="confused cat gif" width={360} height={240} unoptimized />
      <h1>404 Not Found</h1>
      <p>요청한 페이지를 찾을 수 없습니다.</p>
    </main>
  );
}
