"use client";
import { useEffect, useState } from "react";


/**
 * Detects if the current page is loaded in a mobile or desktop view
 * @returns true if the current screen is over 768px, or in other words in desktop mode. false otherwise.
 */
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
