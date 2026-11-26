"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationPreset, QuestionGenerationQuotaResponse } from "@pte/api-client";
import { QuantityStepper, Select, Textarea } from "@pte/ui";
import {
  GENERATION_CEFR_LEVELS,
  GENERATION_POOLS,
  PRESET_MULTIPLIER_MAX,
  PRESET_MULTIPLIER_MIN,
} from "../dialogConstants";
import type { GenerationSelectionState } from "../hooks/useGenerationSelection";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import { quotaRemaining } from "../utils/generationSelection";
import { GenerationDistribution } from "./_GenerationDistribution";

const SECONDS_PER_MINUTE = 60;

interface GenerationSidebarProps {
  state: GenerationSelectionState;
  total: number;
  etaSeconds: number;
  quota: QuestionGenerationQuotaResponse | undefined;
  presets: readonly QuestionGenerationPreset[];
  cap: number;
  messages: DialogMessages;
}

/** The running total and what is left today, the shared settings, and how the questions are spread. */
export const GenerationSidebar = ({
  state,
  total,
  etaSeconds,
  quota,
  presets,
  cap,
  messages,
}: GenerationSidebarProps): ReactElement => {
  const { selection } = state;
  const remaining = quotaRemaining(quota);
  const minutes = Math.max(1, Math.ceil(etaSeconds / SECONDS_PER_MINUTE));
  return (
    <aside className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase text-[var(--ink-muted)]">
          {messages.sideTotal}
        </p>
        <p className="text-4xl font-bold tabular-nums text-[var(--ink-primary)]">{total}</p>
        <p className="text-xs text-[var(--ink-muted)]">
          {formatMessage(messages.sideTotalDetail, { types: selection.rows.length, minutes })}
        </p>
        {remaining !== null ? (
          <p className="mt-1 text-xs text-[var(--ink-secondary)]">
            {messages.summaryRemaining}: {remaining}
            {quota?.scope ? ` (${messages[`summaryScope${quota.scope}`]})` : ""}
          </p>
        ) : null}
      </div>
      {presets.length > 0 ? (
        <QuantityStepper
          label={messages.presetMultiplierLabel}
          value={state.multiplier}
          min={PRESET_MULTIPLIER_MIN}
          max={PRESET_MULTIPLIER_MAX}
          onChange={(value) => state.setMultiplier(value, presets, cap)}
        />
      ) : null}
      <div className="grid grid-cols-2 items-end gap-3">
        <Select
          id="generation-pool"
          label={messages.poolLabel}
          value={selection.pool}
          options={GENERATION_POOLS.map((pool) => ({
            value: pool,
            label: messages[`pool${pool}`],
          }))}
          onChange={(event) => state.setShared({ pool: event.target.value })}
        />
        <Select
          id="generation-default-cefr"
          label={messages.defaultCefrLabel}
          value={selection.defaultCefr}
          options={GENERATION_CEFR_LEVELS.map((level) => ({ value: level, label: level }))}
          onChange={(event) => state.setShared({ defaultCefr: event.target.value })}
        />
      </div>
      <GenerationDistribution selection={selection} total={total} messages={messages} />
      <Textarea
        id="generation-shared-topics"
        label={messages.sharedTopicsLabel}
        helperText={messages.sharedTopicsHint}
        rows={3}
        value={selection.sharedTopicText}
        onChange={(event) => state.setShared({ sharedTopicText: event.target.value })}
      />
    </aside>
  );
};
