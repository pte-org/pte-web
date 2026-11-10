"use client";

import type { ReactElement } from "react";
import { Button, DashboardCard } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT } from "../constants";
import type { StudioGap } from "../types";

interface StudioGapListProps {
  gaps: StudioGap[];
  onWrite: (section: string) => void;
}

/** The task types that still lack questions, each with a way to start writing them. */
export const StudioGapList = ({ gaps, onWrite }: StudioGapListProps): ReactElement | null => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  if (gaps.length === 0) return null;

  return (
    <DashboardCard>
      <section aria-label={text.GAPS_TITLE} className="space-y-3">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">{text.GAPS_TITLE}</h2>
        <ul className="divide-y divide-[var(--shell-border)]">
          {gaps.map(({ tile, missing }) => (
            <li key={tile.key} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--ink-primary)]">
                  {tile.type.displayName}
                </span>
                <span className="block text-xs text-[var(--ink-muted)]">
                  {text.GAPS_ITEM.replace("{count}", String(missing))}
                </span>
              </span>
              <Button size="sm" variant="secondary" onClick={() => onWrite(tile.type.section)}>
                {text.WRITE_MORE}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </DashboardCard>
  );
};
