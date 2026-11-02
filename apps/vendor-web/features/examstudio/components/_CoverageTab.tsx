"use client";

import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { STUDIO_SECTIONS } from "../constants";
import type { StudioModel } from "../types";
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
  onSelectTemplate: (publicId: string) => void;
  onCreateDraft: () => void;
  onOpenCompose: () => void;
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
}: CoverageTabProps): ReactElement => (
  <div className="space-y-5">
    <StudioReadiness
      model={model}
      template={template}
      templates={templates}
      editable={editable}
      isCreatingDraft={isCreatingDraft}
      onSelectTemplate={onSelectTemplate}
      onCreateDraft={onCreateDraft}
      onOpenCompose={onOpenCompose}
    />
    <StudioLegend />
    <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
      {STUDIO_SECTIONS.map((section) => (
        <StudioSkillGroup
          key={section}
          section={section}
          tiles={model.tiles.filter((tile) => tile.type.section === section)}
          selectedKey={selectedKey}
          onSelect={onSelect}
        />
      ))}
    </div>
  </div>
);
