"use client";

import { useState, type ReactElement } from "react";
import { Alert, MapPinIcon } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteCopy, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";
import { VietnamMap } from "./_VietnamMap";

/** Where PTE can be taken in Vietnam: pinned map, city cards and the sourced facts with their caveat. */
export const AboutVietnam = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { vietnam } = useAboutPteLanding();
  const [active, setActive] = useState<number | null>(null);
  return (
    <AboutSection id="vietnam" eyebrow={vietnam.pill} title={copy.vietnam.title} intro={vietnam.intro} centered>
      <div className="grid items-center gap-10 lg:grid-cols-[2fr_3fr]">
        <figure className="mx-auto w-full max-w-md">
          <VietnamMap cities={vietnam.cities} active={active} labels={vietnam.map} />
          <figcaption className="mt-2 text-center text-xs text-[var(--ink-muted)]">{vietnam.map.title}</figcaption>
        </figure>
        <div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {vietnam.cities.map((city, index) => (
              <li
                key={city}
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                className={`${THEMED_CARD} flex cursor-default items-center gap-3 p-4 shadow-sm transition ${
                  active === index ? "border-action ring-2 ring-action/30" : ""
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-action text-sm font-bold text-white">
                  <MapPinIcon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block font-semibold text-[var(--home-navy)]">{city}</span>
                  <span className="text-xs text-[var(--ink-muted)]">{vietnam.cityNotes[index]}</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-6 space-y-2 text-sm leading-6 text-[var(--ink-secondary)]">
            {copy.vietnam.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-action" />
                {point}
              </li>
            ))}
          </ul>
          <SourceRefs ids={copy.vietnam.src} label={copy.sourceLabel} />
          <div className="mt-4">
            <Alert tone="warning">{copy.vietnam.caveat}</Alert>
          </div>
        </div>
      </div>
    </AboutSection>
  );
};
