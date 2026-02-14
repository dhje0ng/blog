"use client";

import { useMemo, useState } from "react";

export function OverviewTools() {
  const [message, setMessage] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  const overviewUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}/overview`;
  }, []);

  const handleShare = async () => {
    if (!overviewUrl) {
      return;
    }

    setIsSharing(true);
    setMessage("");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "N-Blog overview",
          text: "N-Blog overview 페이지를 공유합니다.",
          url: overviewUrl
        });
        setMessage("공유 시트를 열었어요.");
        return;
      }

      await navigator.clipboard.writeText(overviewUrl);
      setMessage("overview 링크를 클립보드에 복사했어요.");
    } catch {
      setMessage("공유를 완료하지 못했어요. 다시 시도해 주세요.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="overview-tools" aria-label="overview tools">
      <a className="overview-tool-link" href="/sitemap.xml" target="_blank" rel="noreferrer">
        sitemap
      </a>
      <button type="button" className="overview-tool-button" onClick={handleShare} disabled={isSharing}>
        페이지 공유하기
      </button>
      {message ? <p className="overview-tool-feedback">{message}</p> : null}
    </div>
  );
}
