"use client";

import type { ReactElement } from "react";
import {
  Alert,
  CalculatorIcon,
  ChartBarIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  CollapsibleSection,
  MessageSquareTextIcon,
  ProgressBar,
  useLocale,
} from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { ScoringRules } from "./_ScoringRules";
import { ScoringStory } from "./_ScoringStory";
import { SkillFlowDiagram } from "./_SkillFlowDiagram";
import { SourceRefs } from "./_SourceRefs";

const SCORE_GUIDE_SOURCE = [14];
const STEP_ICONS = [MessageSquareTextIcon, ClipboardCheckIcon, CalculatorIcon, ChartBarIcon] as const;
/** Score Guide p. 8 worked example. */
const EXAMPLE = [
  { name: "Content", achieved: 4, max: 6 },
  { name: "Pronunciation", achieved: 3, max: 5 },
  { name: "Oral Fluency", achieved: 2, max: 5 },
] as const;
const EXAMPLE_SCORE = 56;

export const ScoringFlow = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { scoring } = useAboutPteLanding();
  const { locale } = useLocale();
  const { flow } = copy;
  return (
    <AboutSection
      id="scoring"
      eyebrow={scoring.pill}
      title={scoring.title}
      intro={
        <>
          {flow.intro}
          <SourceRefs ids={SCORE_GUIDE_SOURCE} label={copy.sourceLabel} />
        </>
      }
    >
      <div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
        <ol className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {scoring.steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <li key={step.title} className="relative text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--action-tint)] text-action shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                {index < scoring.steps.length - 1 && (
                  <ChevronRightIcon className="absolute -right-4 top-4 hidden h-5 w-5 text-[var(--ink-muted)] xl:block" />
                )}
                <h3 className="mt-3 text-sm font-bold text-[var(--home-navy)]">{step.title}</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-secondary)]">{step.text}</p>
              </li>
            );
          })}
        </ol>
        <div className={`${THEMED_CARD} bg-[var(--action-tint)] p-5`}>
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-bold text-[var(--home-navy)]">{scoring.exampleTitle}</h3>
            <span className="text-xs text-[var(--ink-muted)]">{scoring.exampleNote}</span>
          </div>
          <ul className="mt-4 space-y-3">
            {EXAMPLE.map((trait) => (
              <li key={trait.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--ink-secondary)]">{trait.name}</span>
                  <span className="font-bold tabular-nums">{`${trait.achieved} / ${trait.max}`}</span>
                </div>
                <ProgressBar value={trait.achieved} max={trait.max} label={trait.name} />
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between border-t border-[var(--shell-border)] pt-3 text-sm">
            <span className="font-mono text-xs text-[var(--ink-secondary)]">(4 + 3 + 2) ÷ 16 × 100</span>
            <span>
              <span className="mr-2 text-[var(--ink-secondary)]">{scoring.exampleResult}</span>
              <span className="text-2xl font-bold text-action">{EXAMPLE_SCORE}</span>
            </span>
          </p>
          <p className="mt-2 text-xs font-medium text-rose-600">{flow.story.gateNote}</p>
        </div>
      </div>
      <div className="mt-10 space-y-4">
        <CollapsibleSection title={scoring.rules} subtitle={flow.rulesIntro} defaultExpanded={false} className={`${THEMED_CARD} p-5`}>
          <p className="mb-4 text-xs text-[var(--ink-muted)]">{flow.levelsNote}</p>
          <ScoringRules copy={copy} locale={locale === "vi" ? "vi" : "en"} />
        </CollapsibleSection>
        <CollapsibleSection title={scoring.technical} defaultExpanded={false} className={`${THEMED_CARD} p-5`}>
          <ScoringStory copy={copy} />
          <div className="mt-8">
            <h3 className="font-semibold text-[var(--ink-primary)]">{flow.integratedTitle}</h3>
            <p className="mb-4 mt-1 text-sm text-[var(--ink-muted)]">{flow.integratedNote}</p>
            <SkillFlowDiagram skillLabels={copy.skills} title={flow.integratedTitle} />
          </div>
        </CollapsibleSection>
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
