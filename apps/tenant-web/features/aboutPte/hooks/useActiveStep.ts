"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** The step whose block crosses the middle of the viewport; drives the sticky scrollytelling visual. */
export const useActiveStep = (
  count: number,
): { active: number; register: (index: number) => (node: HTMLElement | null) => void } => {
  const [active, setActive] = useState(0);
  const nodes = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = nodes.current.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      // A thin band across the middle of the screen: exactly one step is "being read" at a time.
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.current.slice(0, count).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [count]);

  const register = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      nodes.current[index] = node;
    },
    [],
  );

  return { active, register };
};
