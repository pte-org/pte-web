"use client";

import type { ReactElement } from "react";
import { Alert, ChevronRightIcon, useLocale } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { ScoringRules } from "./_ScoringRules";
import { SkillFlowDiagram } from "./_SkillFlowDiagram";
import { SourceRefs } from "./_SourceRefs";

const SCORE_GUIDE_SOURCE = [14];

export const ScoringFlow = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { locale } = useLocale();
  const { flow } = copy;
  return (
    <AboutSection id="scoring" title={flow.title}>
      <p className={ABOUT_PTE_LAYOUT.muted}>
        {flow.intro}
        <SourceRefs ids={SCORE_GUIDE_SOURCE} label={copy.sourceLabel} />
      </p>
      <ol className="mt-6 grid gap-3 lg:grid-cols-4">
        {flow.steps.map((step, index) => (
          <li key={step.title} className={`${ABOUT_PTE_LAYOUT.card} relative`}>
            <h3 className="font-semibold text-action">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
            {index < flow.steps.length - 1 && (
              <ChevronRightIcon className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-400 lg:block" />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Alert tone="info" title={flow.exampleTitle}>
          <ul className="list-disc space-y-1 pl-5">
            {flow.example.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Alert>
      </div>
      <h3 className="mt-10 text-xl font-semibold text-slate-900">{flow.rulesTitle}</h3>
      <p className={`mb-4 mt-1 ${ABOUT_PTE_LAYOUT.muted}`}>{flow.rulesIntro}</p>
      <ScoringRules copy={copy} locale={locale === "vi" ? "vi" : "en"} />
      <div className={`mt-8 ${ABOUT_PTE_LAYOUT.card}`}>
        <h3 className="font-semibold text-slate-900">{flow.integratedTitle}</h3>
        <p className="mb-4 mt-1 text-sm text-slate-500">{flow.integratedNote}</p>
        <SkillFlowDiagram skillLabels={copy.skills} title={flow.integratedTitle} />
      </div>
      <div className="mt-8">
        <Alert tone="warning" title={flow.simplificationsTitle}>
          <ul className="list-disc space-y-1 pl-5">
            {flow.simplifications.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Alert>
      </div>
    </AboutSection>
  );
};
