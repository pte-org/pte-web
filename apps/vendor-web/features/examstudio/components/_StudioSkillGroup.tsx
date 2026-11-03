"use client";

import type { ReactElement } from "react";
import { DashboardCard } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SCORE_TEMPLATE_SECTION_LABELS } from "@/features/scoretemplate/constants";
import type { StudioTile } from "../types";
import { StudioTileButton } from "./_StudioTile";

interface StudioSkillGroupProps {
  section: string;
  tiles: StudioTile[];
  selectedKey: string | null;
  showDistinctExams: boolean;
  onSelect: (key: string) => void;
}

export const StudioSkillGroup = ({
  section,
  tiles,
  selectedKey,
  showDistinctExams,
  onSelect,
}: StudioSkillGroupProps): ReactElement => {
  const labels = useAdminCopy(SCORE_TEMPLATE_SECTION_LABELS);
  const readyCount = tiles.filter((tile) => tile.state === "ready").length;

  return (
    <DashboardCard>
      <section aria-label={labels[section as keyof typeof labels] ?? section} className="space-y-3">
        <header className="flex items-baseline gap-2">
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">
            {labels[section as keyof typeof labels] ?? section}
          </h2>
          <span className="text-xs text-[var(--ink-muted)]">
            {readyCount}/{tiles.length}
          </span>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tiles.map((tile) => (
            <StudioTileButton
              key={tile.key}
              tile={tile}
              selected={tile.key === selectedKey}
              showDistinctExams={showDistinctExams}
              onSelect={onSelect}
            />
          ))}
        </div>
      </section>
    </DashboardCard>
  );
};
