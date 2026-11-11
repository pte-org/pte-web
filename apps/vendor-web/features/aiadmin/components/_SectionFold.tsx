"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { DisclosureChevron } from "@pte/ui";
import type { DocumentSection } from "../promptText";

/** Sections with more lines than this start folded, so a long prompt reads as a list of headings first. */
export const LONG_SECTION_LINES = 6;

/** Whether a section is long enough to fold: lines of text plus one line per output field. */
export const isLongSection = (section: DocumentSection): boolean =>
  section.text.split("\n").length + (section.fields?.length ?? 0) > LONG_SECTION_LINES;

interface SectionFoldProps {
  long: boolean;
  label: string;
  header: ReactNode;
  children: ReactNode;
}

/** A section header with the common chevron; the body of a long section is folded until it is opened. */
export const SectionFold = ({ long, label, header, children }: SectionFoldProps): ReactElement => {
  const [open, setOpen] = useState(!long);
  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">{header}</div>
        {long && (
          <button type="button" aria-expanded={open} aria-label={label} onClick={() => setOpen((value) => !value)}>
            <DisclosureChevron expanded={open} />
          </button>
        )}
      </div>
      {open && children}
    </div>
  );
};
