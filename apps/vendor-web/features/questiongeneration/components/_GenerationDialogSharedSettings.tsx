"use client";

import type { ReactElement } from "react";
import { CollapsibleSection, Select, Textarea } from "@pte/ui";
import { GENERATION_CEFR_LEVELS, GENERATION_POOLS } from "../dialogConstants";
import type { DialogMessages } from "../messages/dialog.en";
import type { GenerationSelection } from "../utils/generationSelection";

interface SharedSettingsProps {
  selection: GenerationSelection;
  messages: DialogMessages;
  onChange: (patch: Partial<Pick<GenerationSelection, "pool" | "defaultCefr" | "sharedTopicText">>) => void;
}

export const GenerationDialogSharedSettings = ({ selection, messages, onChange }: SharedSettingsProps): ReactElement => (
  <CollapsibleSection title={messages.sharedTitle}>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Select
        id="generation-pool"
        label={messages.poolLabel}
        value={selection.pool}
        options={GENERATION_POOLS.map((pool) => ({ value: pool, label: messages[`pool${pool}`] }))}
        onChange={(event) => onChange({ pool: event.target.value })}
      />
      <Select
        id="generation-default-cefr"
        label={messages.defaultCefrLabel}
        value={selection.defaultCefr}
        options={GENERATION_CEFR_LEVELS.map((level) => ({ value: level, label: level }))}
        onChange={(event) => onChange({ defaultCefr: event.target.value })}
      />
      <Textarea
        id="generation-shared-topics"
        className="md:col-span-3"
        label={messages.sharedTopicsLabel}
        helperText={messages.sharedTopicsHint}
        rows={2}
        value={selection.sharedTopicText}
        onChange={(event) => onChange({ sharedTopicText: event.target.value })}
      />
    </div>
  </CollapsibleSection>
);
