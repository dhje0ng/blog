"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const MAP_IMAGE_BY_THEME: Record<ThemeMode, { src: string; alt: string; width: number; height: number }> = {
  light: {
    src: "/map_light.png",
    alt: "Seoul map (light theme)",
    width: 509,
    height: 308
  },
  dark: {
    src: "/map_dark.png",
    alt: "Seoul map (dark theme)",
    width: 504,
    height: 242
  }
};

function getDocumentTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function OverviewMap() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    setTheme(getDocumentTheme());

    const observer = new MutationObserver(() => {
      setTheme(getDocumentTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });

    return () => observer.disconnect();
  }, []);

  const selectedMap = MAP_IMAGE_BY_THEME[theme];

  return (
    <div className="overview-map-frame-shell">
      <Image
        src={selectedMap.src}
        alt={selectedMap.alt}
        className="overview-map-frame"
        width={selectedMap.width}
        height={selectedMap.height}
        sizes={`(max-width: 1040px) calc(100vw - 92px), ${selectedMap.width}px`}
      />
    </div>
  );
}
