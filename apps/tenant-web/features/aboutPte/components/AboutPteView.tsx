"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { PublicShell } from "@/features/public/components/PublicShell";
import { ABOUT_PTE_LAYOUT, ABOUT_PTE_SECTION_IDS } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutBasics } from "./AboutBasics";
import { AboutHistory, AboutOverview, AboutRecognition, AboutVietnam } from "./AboutIntroSections";
import { ComparisonTable } from "./ComparisonTable";
import { ScoringFlow } from "./ScoringFlow";
import { ScoringSimulation } from "./ScoringSimulation";
import { SourcesList } from "./SourcesList";

const AboutHero = (): ReactElement => {
  const { hero } = useAboutPteCopy();
  return (
    <header className="py-12 lg:py-20">
      <p className="text-xs font-semibold uppercase tracking-widest text-action">{hero.eyebrow}</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{hero.title}</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{hero.description}</p>
      <nav aria-label={hero.title} className="mt-8 flex flex-wrap gap-2">
        {ABOUT_PTE_SECTION_IDS.map((id, index) => (
          <Link
            key={id}
            href={`#${id}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-action hover:text-action"
          >
            {hero.toc[index]}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export const AboutPteView = (): ReactElement => (
  <PublicShell home>
    <div className={ABOUT_PTE_LAYOUT.container}>
      <AboutHero />
      <AboutOverview />
      <AboutBasics />
      <AboutHistory />
      <AboutRecognition />
      <AboutVietnam />
      <ComparisonTable />
      <ScoringFlow />
      <ScoringSimulation />
      <SourcesList />
    </div>
  </PublicShell>
);
