"use client";

import type { ReactElement } from "react";
import { THEMED_CARD } from "../constants/aboutPteLayout";
import { useAboutPteGuide } from "../hooks/useAboutPteCopy";
import { AboutSection } from "./_AboutSection";

/** Short definitions of the words a newcomer meets on this page, in the order they appear. */
export const AboutGlossary = (): ReactElement => {
  const { glossary } = useAboutPteGuide();
  return (
    <AboutSection id="glossary" eyebrow={glossary.pill} title={glossary.title} intro={glossary.intro} centered>
      <div className={`${THEMED_CARD} overflow-hidden shadow-sm`}>
        {/* -mb-px: the last row's divider would otherwise double up with the card's own border. */}
        <dl className="-mb-px grid md:grid-cols-2">
          {glossary.terms.map((entry) => (
            <div key={entry.term} className="border-b border-[var(--shell-border)] px-5 py-4 md:odd:border-r">
              <dt className="font-semibold text-[var(--home-navy)]">{entry.term}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--ink-secondary)]">{entry.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </AboutSection>
  );
};
