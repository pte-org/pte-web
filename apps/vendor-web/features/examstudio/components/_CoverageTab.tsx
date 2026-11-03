"use client";

import { useState, type ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT, STUDIO_SECTIONS } from "../constants";
import type { StudioModel, StudioTileState } from "../types";
import { StudioGapList } from "./_StudioGapList";
import { StudioLegend } from "./_StudioLegend";
import { StudioReadiness } from "./_StudioReadiness";
import { StudioSkillGroup } from "./_StudioSkillGroup";

interface CoverageTabProps {
  model: StudioModel;
  template: ScoreTemplateResponse;
  templates: ScoreTemplateResponse[];
  editable: boolean;
  isCreatingDraft: boolean;
  selectedKey: string | null;
  /** The other templates that can be counted too, and which of them are. */
  onSelectTemplate: (publicId: string) => void;
  onCreateDraft: () => void;
  /** Opens the compose tab, on one skill when given. */
  onOpenCompose: (section?: string) => void;
  onSelect: (key: string) => void;
}

/** Every task type as a tile, grouped by skill, with how ready the template is overall. */
export const CoverageTab = ({
  model,
  template,
  templates,
  editable,
  isCreatingDraft,
  selectedKey,
  onSelectTemplate,
  onCreateDraft,
  onOpenCompose,
  onSelect,
}: CoverageTabProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const [filter, setFilter] = useState<StudioTileState | null>(null);
  const [avoidRepeats, setAvoidRepeats] = useState(false);
  return (
    <div className="space-y-5">
      <StudioReadiness
        model={model}
        template={template}
        templates={templates}
        editable={editable}
        isCreatingDraft={isCreatingDraft}
        onSelectTemplate={onSelectTemplate}
        onCreateDraft={onCreateDraft}
        onOpenCompose={() => onOpenCompose()}
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StudioLegend tiles={model.tiles} filter={filter} onFilter={setFilter} />
            <label
              className="flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-secondary)]"
              title={text.AVOID_REPEATS_HINT}
            >
              <input
                type="checkbox"
                checked={avoidRepeats}
                onChange={(event) => setAvoidRepeats(event.target.checked)}
              />
              {text.AVOID_REPEATS}
            </label>
          </div>
        }
      />
      <StudioGapList
        gaps={model.tiles
          .filter((tile) => tile.required > tile.available)
          .map((tile) => ({ tile, missing: tile.required - tile.available }))}
        onWrite={onOpenCompose}
      />
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
        {STUDIO_SECTIONS.map((section) => (
          <StudioSkillGroup
            key={section}
            section={section}
            tiles={model.tiles.filter(
              (tile) => tile.type.section === section && (filter === null || tile.state === filter),
            )}
            selectedKey={selectedKey}
            showDistinctExams={avoidRepeats}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
