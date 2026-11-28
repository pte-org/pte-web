"use client";

import { useEffect, useState } from "react";

/** True once the element with this id has scrolled out of view above the screen. */
export function usePastElement(id: string): boolean {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const element = document.getElementById(id);
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0),
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [id]);

  return past;
}
