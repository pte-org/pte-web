"use client";

import type { ReactElement } from "react";
import { ABOUT_PTE_LAYOUT, THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";

/** Index of PTE Academic in the comparison columns: the test this project is about, so it is highlighted. */
const FEATURED_COLUMN = 1;

/** One card per test, side by side; every card lists the same criteria in the same order. */
export const ComparisonTable = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { headers, rows, caption, src, title, featured } = copy.comparison;
  const tests = headers.slice(1).map((name, offset) => ({ name, column: offset + 1 }));
  return (
    <AboutSection id="comparison" title={title}>
      <p className={`mb-6 ${ABOUT_PTE_LAYOUT.muted}`}>
        {caption}
        <SourceRefs ids={src} label={copy.sourceLabel} />
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tests.map((test) => {
          const isFeatured = test.column === FEATURED_COLUMN;
          return (
            <li
              key={test.name}
              className={`${THEMED_CARD} relative flex flex-col p-5 ${
                isFeatured ? "border-2 border-action shadow-lg lg:-translate-y-2" : "shadow-sm"
              }`}
            >
              {isFeatured && (
                <span className="absolute -top-3 left-5 rounded-full bg-action px-3 py-0.5 text-xs font-semibold text-white">
                  {featured}
                </span>
              )}
              <h3 className={`text-lg font-bold ${isFeatured ? "text-action" : ""}`}>{test.name}</h3>
              <p className="text-sm text-[var(--ink-muted)]">{rows[0][test.column]}</p>
              <dl className="mt-4 space-y-3 border-t border-[var(--shell-border)] pt-4">
                {rows.slice(1).map((row) => (
                  <div key={row[0]}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">{row[0]}</dt>
                    <dd className="mt-0.5 text-sm font-medium">{row[test.column]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          );
        })}
      </ul>
    </AboutSection>
  );
};
