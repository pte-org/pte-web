"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ABOUT_PTE_SOURCES } from "../constants/aboutPteSources";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";

export const SourcesList = (): ReactElement => {
  const { sources } = useAboutPteCopy();
  const landing = useAboutPteLanding();
  return (
    <AboutSection id="sources" eyebrow={landing.sources.pill} title={sources.title} intro={sources.note} tone="tint">
      <ol className="grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
        {ABOUT_PTE_SOURCES.map((source) => (
          <li key={source.id} id={`source-${source.id}`} className="flex scroll-mt-28 gap-2">
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
