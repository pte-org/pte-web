"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { ABOUT_PTE_SOURCES } from "../constants/aboutPteSources";
import { OPEN_SOURCES_EVENT } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";

/** How long the entries a citation pointed at stay highlighted. */
const HIGHLIGHT_MS = 6000;

interface Reveal {
  ids: readonly number[];
  /** A new object for every click, so clicking the same link again scrolls and highlights again. */
  token: number;
}

/** Reference list, always open; a citation link scrolls to its entries and highlights them for a moment. */
export const SourcesList = (): ReactElement => {
  const { sources } = useAboutPteCopy();
  const landing = useAboutPteLanding();
  const [reveal, setReveal] = useState<Reveal | null>(null);

  useEffect(() => {
    let count = 0;
    const onReveal = (event: Event): void => {
      const { detail } = event as CustomEvent<readonly number[] | undefined>;
      count += 1;
      setReveal({ ids: detail ?? [], token: count });
    };
    window.addEventListener(OPEN_SOURCES_EVENT, onReveal);
    return () => window.removeEventListener(OPEN_SOURCES_EVENT, onReveal);
  }, []);

  // Scroll to the first entry a citation pointed at, then let the highlight fade so the list does not stay marked.
  useEffect(() => {
    if (!reveal || reveal.ids.length === 0) return;
    document.getElementById(`source-${reveal.ids[0]}`)?.scrollIntoView({ block: "center" });
    const timer = window.setTimeout(() => setReveal(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [reveal]);

  const highlighted = new Set(reveal?.ids ?? []);

  return (
    <AboutSection id="sources" eyebrow={landing.sources.pill} title={sources.title} intro={sources.note} tone="tint" centered>
      <ol id="sources-list" className="grid gap-x-6 gap-y-1 text-sm md:grid-cols-2">
        {ABOUT_PTE_SOURCES.map((source) => (
          <li
            key={source.id}
            id={`source-${source.id}`}
            className={`flex scroll-mt-28 gap-2 rounded-lg px-3 py-1.5 transition-colors duration-500 ${
              highlighted.has(source.id) ? "bg-[var(--action-tint)] ring-2 ring-action/40" : ""
            }`}
          >
            <span className="w-8 shrink-0 font-semibold text-[var(--ink-muted)]">{`[${source.id}]`}</span>
            <Link href={source.url} target="_blank" rel="noopener noreferrer" className="text-action hover:underline">
              {source.label}
            </Link>
          </li>
        ))}
      </ol>
    </AboutSection>
  );
};
