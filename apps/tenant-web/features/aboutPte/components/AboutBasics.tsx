"use client";

import type { ReactElement } from "react";
import { useLocale } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { TaskGuide } from "./_TaskGuide";

export const AboutBasics = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { locale } = useLocale();
  const { basics } = copy;
  return (
    <AboutSection id="basics" title={basics.title}>
      <p className={ABOUT_PTE_LAYOUT.muted}>{basics.intro}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {basics.concepts.map((concept) => (
          <article key={concept.title} className={`${ABOUT_PTE_LAYOUT.card} border-l-4 border-l-action`}>
            <h3 className="font-semibold text-slate-900">{concept.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{concept.text}</p>
          </article>
        ))}
      </div>
      <h3 className="mt-10 text-xl font-semibold text-slate-900">{basics.guideTitle}</h3>
      <p className={`mb-4 mt-1 ${ABOUT_PTE_LAYOUT.muted}`}>{basics.guideIntro}</p>
      <TaskGuide copy={copy} locale={locale === "vi" ? "vi" : "en"} />
    </AboutSection>
  );
};
