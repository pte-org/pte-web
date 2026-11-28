"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { OPEN_SOURCES_EVENT } from "../constants/aboutPteLayout";

interface SourceRefsProps {
  ids: readonly number[];
  label: string;
  /** When set, the numbered links are replaced by one link with this text to the whole sources list. */
  collapsedLabel?: string;
}

/** Opens the sources list and asks it to highlight these entries. */
const revealSources = (ids: readonly number[]): void => {
  window.dispatchEvent(new CustomEvent<readonly number[]>(OPEN_SOURCES_EVENT, { detail: ids }));
};

/** Superscript citation links that jump to the sources list at the bottom of the page. */
export const SourceRefs = ({ ids, label, collapsedLabel }: SourceRefsProps): ReactElement | null => {
  if (ids.length === 0) return null;
  if (collapsedLabel) {
    return (
      <Link
        href="#sources"
        className="ml-2 whitespace-nowrap text-xs font-semibold text-action hover:underline"
        onClick={() => revealSources(ids)}
      >
        {`${collapsedLabel} ↗`}
      </Link>
    );
  }
  return (
    <sup className="ml-1 whitespace-nowrap text-xs" aria-label={label}>
      {ids.map((id) => (
        <Link
          key={id}
          href={`#source-${id}`}
          className="mr-0.5 text-action hover:underline"
          onClick={() => revealSources([id])}
        >
          [{id}]
        </Link>
      ))}
    </sup>
  );
};
