"use client";
import { useEffect, useState } from "react";

export default function useIsOverMd() {
  const [isOverMd, setIsOverMd] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");

    const updateMatch = () => setIsOverMd(media.matches);
    updateMatch();

    media.addEventListener("change", updateMatch);
    return () => media.removeEventListener("change", updateMatch);
  }, []);

  return isOverMd;
}
