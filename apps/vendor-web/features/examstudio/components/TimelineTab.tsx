"use client";

import { useMemo, type ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { EmptyState } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT, SECONDS_PER_MINUTE } from "../constants";
import { buildTimeline } from "../timeline";
import type { StudioTile } from "../types";
import { TimelineLaneView } from "./_TimelineLane";

interface TimelineTabProps {
  template: ScoreTemplateResponse;
  tiles: StudioTile[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
}

/** How long the exam runs and where the time goes. Read here; the counts and times are set on the template. */
export const TimelineTab = ({
  template,
  tiles,
  selectedKey,
  onSelect,
}: TimelineTabProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const lanes = useMemo(() => buildTimeline(template.items), [template.items]);
  const names = useMemo(
    () => new Map(tiles.map((tile) => [tile.key, tile.type.displayName])),
    [tiles],
  );
  const totalSeconds = lanes.reduce((sum, lane) => sum + lane.seconds, 0);

  if (template.items.length === 0) return <EmptyState title={text.TIMELINE_EMPTY} />;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-[var(--ink-primary)]">
        {text.TIMELINE_TOTAL.replace(
          "{minutes}",
          String(Math.round(totalSeconds / SECONDS_PER_MINUTE)),
        ).replace("{count}", String(template.items.length))}
      </p>
      <p className="text-sm text-[var(--ink-secondary)]">{text.TIMELINE_HINT}</p>
      <div className="space-y-3">
        {lanes.map((lane) => (
          <TimelineLaneView
            key={lane.section}
            lane={lane}
            names={names}
            selectedKey={selectedKey}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
