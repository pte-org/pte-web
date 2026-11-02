"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { Chip, ChevronDownIcon, ChevronRightIcon, type ChipTone } from "@pte/ui";

interface PaletteGroupProps {
  title: string;
  tone: ChipTone;
  count: number;
  children: ReactNode;
}

/** One section's task types under a header that folds them away; open by default. */
export const PaletteGroup = ({ title, tone, count, children }: PaletteGroupProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);
  const Chevron = isOpen ? ChevronDownIcon : ChevronRightIcon;

  return (
    <section className="space-y-1">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left hover:bg-[var(--surface-subtle)]"
      >
        <Chevron className="h-3.5 w-3.5 shrink-0 text-[var(--ink-muted)]" />
        <Chip tone={tone} size="sm">
          {title}
        </Chip>
        <span className="ml-auto text-xs text-[var(--ink-muted)]">{count}</span>
      </button>
      {isOpen && children}
    </section>
  );
};
