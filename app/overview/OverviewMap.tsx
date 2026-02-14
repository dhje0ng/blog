"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

const MAP_IMAGE_BY_THEME: Record<ThemeMode, { src: string; alt: string }> = {
  light: {
    src: "/map_light.png",
    alt: "Seoul map (light theme)"
  },
  dark: {
    src: "/map_dark.png",
    alt: "Seoul map (dark theme)"
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
        key={theme}
        src={selectedMap.src}
        alt={selectedMap.alt}
        className="overview-map-frame"
        fill
        sizes="(max-width: 1040px) calc(100vw - 92px), 509px"
      />
    </div>
  );
}
