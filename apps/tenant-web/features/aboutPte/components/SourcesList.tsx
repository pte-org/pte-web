"use client";

import { useEffect, useState, type ReactElement } from "react";
import Link from "next/link";
import { Badge } from "@pte/ui";
import { ABOUT_PTE_SOURCES } from "../constants/aboutPteSources";
import { OPEN_SOURCES_EVENT, THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
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
  const { sources: sourceText } = useAboutPteExtras();
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
      <div className={`${THEMED_CARD} overflow-hidden shadow-sm`}>
        {/* -mb-px: the last row's divider would otherwise double up with the card's own border. */}
        <ol id="sources-list" className="-mb-px grid text-sm md:grid-cols-2">
          {ABOUT_PTE_SOURCES.map((source) => (
            <li
              key={source.id}
              id={`source-${source.id}`}
              className={`scroll-mt-28 border-b border-[var(--shell-border)] transition-colors duration-500 md:odd:border-r ${
                highlighted.has(source.id) ? "bg-[var(--action-tint)] ring-2 ring-inset ring-action/40" : ""
              }`}
            >
              <Link
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-subtle)]"
              >
                <span className="w-7 shrink-0 text-right font-semibold tabular-nums text-[var(--ink-muted)]">{source.id}</span>
                <span className="min-w-0 flex-1 text-[var(--ink-primary)] group-hover:text-action">{source.label}</span>
                {/* Badge and arrow share one fixed cluster so a long title wraps on the left without pushing the badge down. */}
                <span className="flex shrink-0 items-center gap-2">
                  {source.kind && (
                    <Badge variant={source.kind === "thirdParty" ? "warning" : "neutral"} className="px-2 py-0.5 before:hidden">
                      {sourceText.kinds[source.kind]}
                    </Badge>
                  )}
                  <span className="text-[var(--ink-muted)] group-hover:text-action" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </AboutSection>
  );
};
