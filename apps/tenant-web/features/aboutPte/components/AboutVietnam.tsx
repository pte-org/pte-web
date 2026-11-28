"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, InfoIcon, MapPinIcon } from "@pte/ui";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { PEARSON_BOOKING_URL } from "../constants/aboutPteSources";
import { useAboutPteCopy, useAboutPteExtras, useAboutPteLanding } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";
import { SourceRefs } from "./_SourceRefs";
import { VietnamMap } from "./_VietnamMap";

/** Where PTE can be taken in Vietnam: pinned map, city cards and the sourced facts with their caveat. */
export const AboutVietnam = (): ReactElement => {
  const copy = useAboutPteCopy();
  const { vietnam } = useAboutPteLanding();
  const extras = useAboutPteExtras();
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
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                    active === index ? "bg-action text-white" : "bg-[var(--action-tint)] text-action"
                  }`}
                >
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
              <li key={point.label} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-action" />
                <span>
                  <strong className="font-semibold text-[var(--ink-primary)]">{`${point.label}: `}</strong>
                  {point.text}
                </span>
              </li>
            ))}
          </ul>
          <SourceRefs ids={copy.vietnam.src} label={copy.sourceLabel} collapsedLabel={extras.sources.link(copy.vietnam.src.length)} standalone />
          <div className="mt-4">
            <Alert tone="warning" icon={<InfoIcon className="h-4 w-4" />}>
              {copy.vietnam.caveat.before}
              <Link href={PEARSON_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                {copy.vietnam.caveat.link}
                <span aria-hidden="true"> ↗</span>
              </Link>
              {copy.vietnam.caveat.after}
            </Alert>
          </div>
        </div>
      </div>
    </AboutSection>
  );
};
