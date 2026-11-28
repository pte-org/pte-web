"use client";

import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

/** History timeline next to the recognition list, in one compact band. */
export const AboutBackground = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { background } = useAboutPteLanding();
  const extras = useAboutPteExtras();
  const sourceIds = [...new Set([...copy.history.items, ...copy.recognition.rows].flatMap((entry) => entry.src))].sort((a, b) => a - b);
  return (
    <AboutSection
      id="history"
      eyebrow={background.pill}
      title={background.title}
      intro={
        <>
          {background.intro}
          <SourceRefs ids={sourceIds} label={copy.sourceLabel} collapsedLabel={extras.sources.link(sourceIds.length)} />
        </>
      }
      centered
    >
      <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
        <div>
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{copy.history.title}</h3>
          <ol className="mt-5 pl-6">
            {copy.history.items.map((item, index) => {
              const isLatest = index === copy.history.items.length - 1;
              return (
                <li key={item.year} className="relative pb-5 last:pb-0">
                  {/* One segment per entry, dot to dot, so the line ends on the last dot instead of trailing below it. */}
                  {!isLatest && <span className="absolute -left-6.5 top-2.75 -bottom-2.75 w-0.5 bg-[var(--action-tint)]" aria-hidden="true" />}
                  <span
                    className={`absolute -left-7.5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-action shadow ${
                      isLatest ? "ring-4 ring-action/20" : ""
                    }`}
                  />
                  <p className="flex items-center gap-2 text-sm font-bold text-action">
                    {item.year}
                    {isLatest && (
                      <span className="rounded-full bg-[var(--action-tint)] px-2 py-0.5 text-xs font-semibold">{copy.history.latest}</span>
                    )}
                  </p>
                  <p className="text-sm leading-6 text-[var(--ink-secondary)]">{item.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
        <div id="recognition" className="scroll-mt-24">
          <h3 className="text-lg font-bold text-[var(--home-navy)]">{copy.recognition.title}</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {copy.recognition.rows.map((row) => (
              <li key={row.region} className={`${THEMED_CARD} flex flex-col p-4 shadow-sm`}>
                <p className="font-semibold text-[var(--home-navy)]">{row.region}</p>
                <p className="mt-1 flex-1 text-sm leading-6 text-[var(--ink-secondary)]">{row.text}</p>
                <p className="mt-3 flex flex-wrap gap-1.5">
                  {row.tags.map((tag) => (
                    <Badge key={tag.text} variant={"tone" in tag ? "warning" : "info"} className="px-2 py-0.5 before:hidden">
                      {tag.text}
                    </Badge>
                  ))}
                </p>
              </li>
            ))}
            <li className="rounded-2xl bg-[var(--surface-subtle)] p-4 sm:col-span-2">
              <p className="font-semibold text-[var(--home-navy)]">{copy.recognition.vietnam.region}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">{copy.recognition.vietnam.text}</p>
            </li>
          </ul>
        </div>
      </div>
    </AboutSection>
  );
};
