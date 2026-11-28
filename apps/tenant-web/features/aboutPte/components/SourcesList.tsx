"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { Button } from "@pte/ui";
import { ABOUT_PTE_SOURCES } from "../constants/aboutPteSources";
import { OPEN_SOURCES_EVENT } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";

/** Reference list, collapsed by default: it is reading for the curious, not part of the story. */
export const SourcesList = (): ReactElement => {
  const { sources } = useAboutPteCopy();
  const landing = useAboutPteLanding();
  const extras = useAboutPteExtras();
  const [open, setOpen] = useState(false);
  const pendingSource = useRef<string | null>(null);

  useEffect(() => {
    const reveal = (event: Event): void => {
      const { detail } = event as CustomEvent<number | undefined>;
      pendingSource.current = detail === undefined ? null : String(detail);
      setOpen(true);
    };
    window.addEventListener(OPEN_SOURCES_EVENT, reveal);
    return () => window.removeEventListener(OPEN_SOURCES_EVENT, reveal);
  }, []);

  // A citation link opened the list: the entry exists only now, so scroll to it after the list renders.
  useEffect(() => {
    if (!open || pendingSource.current === null) return;
    document.getElementById(`source-${pendingSource.current}`)?.scrollIntoView({ block: "center" });
    pendingSource.current = null;
  }, [open]);

  return (
    <AboutSection id="sources" eyebrow={landing.sources.pill} title={sources.title} intro={sources.note} tone="tint" centered>
      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-controls="sources-list"
        >
          {open ? extras.sources.hide : extras.sources.show(ABOUT_PTE_SOURCES.length)}
        </Button>
      </div>
      {open && (
        <ol id="sources-list" className="mt-5 grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
          {ABOUT_PTE_SOURCES.map((source) => (
            <li key={source.id} id={`source-${source.id}`} className="flex scroll-mt-28 gap-2">
              <span className="w-8 shrink-0 font-semibold text-[var(--ink-muted)]">{`[${source.id}]`}</span>
              <Link href={source.url} target="_blank" rel="noopener noreferrer" className="text-action hover:underline">
                {source.label}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </AboutSection>
  );
};
