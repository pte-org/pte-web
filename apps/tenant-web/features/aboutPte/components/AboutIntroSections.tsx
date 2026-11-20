"use client";

import type { ReactElement } from "react";
import { Alert } from "@pte/ui";
import { ABOUT_PTE_LAYOUT } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

export const AboutOverview = (): ReactElement => {
  const copy = useAboutPteCopy();
  return (
    <AboutSection id="overview" title={copy.what.title}>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {copy.what.body.map((paragraph) => (
            <p key={paragraph} className={ABOUT_PTE_LAYOUT.muted}>
              {paragraph}
            </p>
          ))}
          <SourceRefs ids={copy.what.src} label={copy.sourceLabel} />
        </div>
        <dl className="grid grid-cols-2 gap-3">
          {copy.what.facts.map((fact) => (
            <div key={fact.label} className={ABOUT_PTE_LAYOUT.card}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{fact.label}</dt>
              <dd className="mt-2 text-base font-semibold text-slate-900">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </AboutSection>
  );
};

export const AboutHistory = (): ReactElement => {
  const copy = useAboutPteCopy();
  return (
    <AboutSection id="history" title={copy.history.title}>
      <ol className="relative space-y-6 border-l-2 border-action/30 pl-6">
        {copy.history.items.map((item) => (
          <li key={item.year} className="relative">
            <span className="absolute -left-8 top-1 h-3 w-3 rounded-full bg-action ring-4 ring-white" />
            <p className="text-sm font-bold text-action">{item.year}</p>
            <p className={ABOUT_PTE_LAYOUT.muted}>
              {item.text}
              <SourceRefs ids={item.src} label={copy.sourceLabel} />
            </p>
          </li>
        ))}
      </ol>
    </AboutSection>
  );
};

export const AboutRecognition = (): ReactElement => {
  const copy = useAboutPteCopy();
  return (
    <AboutSection id="recognition" title={copy.recognition.title}>
      <div className="grid gap-4 md:grid-cols-2">
        {copy.recognition.rows.map((row) => (
          <article key={row.region} className={ABOUT_PTE_LAYOUT.card}>
            <h3 className="font-semibold text-slate-900">{row.region}</h3>
            <p className={`mt-2 ${ABOUT_PTE_LAYOUT.muted}`}>
              {row.text}
              <SourceRefs ids={row.src} label={copy.sourceLabel} />
            </p>
          </article>
        ))}
      </div>
    </AboutSection>
  );
};

export const AboutVietnam = (): ReactElement => {
  const copy = useAboutPteCopy();
  return (
    <AboutSection id="vietnam" title={copy.vietnam.title}>
      <ul className="list-disc space-y-3 pl-5">
        {copy.vietnam.points.map((point) => (
          <li key={point} className={ABOUT_PTE_LAYOUT.muted}>
            {point}
          </li>
        ))}
      </ul>
      <SourceRefs ids={copy.vietnam.src} label={copy.sourceLabel} />
      <div className="mt-6">
        <Alert tone="warning">{copy.vietnam.caveat}</Alert>
      </div>
    </AboutSection>
  );
};
