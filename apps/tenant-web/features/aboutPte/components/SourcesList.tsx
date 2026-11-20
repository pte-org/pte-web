"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { ABOUT_PTE_SOURCES } from "../constants/aboutPteSources";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";

export const SourcesList = (): ReactElement => {
  const { sources } = useAboutPteCopy();
  return (
    <AboutSection id="sources" title={sources.title}>
      <p className={`mb-4 ${ABOUT_PTE_LAYOUT.muted}`}>{sources.note}</p>
      <ol className="space-y-2 text-sm">
        {ABOUT_PTE_SOURCES.map((source) => (
          <li key={source.id} id={`source-${source.id}`} className="scroll-mt-28">
            <span className="mr-2 font-semibold text-slate-500">[{source.id}]</span>
            <Link href={source.url} target="_blank" rel="noopener noreferrer" className="text-action hover:underline">
              {source.label}
            </Link>
          </li>
        ))}
      </ol>
    </AboutSection>
  );
};
