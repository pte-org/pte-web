"use client";

import { useEffect, useState } from "react";
import { pickActiveSection } from "../utils/activeSection";

/** A section counts as current while it crosses the band between 30% and 40% from the top of the screen. */
const READING_BAND = "-30% 0px -60% 0px";

/** The id of the page section being read, so a navigation bar can highlight it. */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const order = key.split("|");
    const elements = order
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const current = pickActiveSection(order, visible);
        if (current) setActive(current);
      },
      { rootMargin: READING_BAND, threshold: 0 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
