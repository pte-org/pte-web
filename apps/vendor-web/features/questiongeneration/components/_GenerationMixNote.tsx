"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationCefrMix } from "@pte/api-client";
import { Button } from "@pte/ui";
import type { DialogMessages } from "../messages/dialog.en";
import { formatMessage } from "../messages/useDialogMessages";
import type { CefrShare } from "../utils/generationMix";

interface GenerationMixNoteProps {
  mix: QuestionGenerationCefrMix;
  shares: readonly CefrShare[];
  messages: DialogMessages;
  onSingleLevel: () => void;
}

/** Says which template's CEFR mix the "full exam" preset spread the questions over, with the way back to one level. */
export const GenerationMixNote = ({
  mix,
  shares,
  messages,
  onSingleLevel,
}: GenerationMixNoteProps): ReactElement => (
  <div className="space-y-2 rounded-md bg-[var(--surface-subtle)] px-3 py-2">
    <p className="text-xs text-[var(--ink-secondary)]">
      {formatMessage(messages.mixNote, {
        name: mix.templateName,
        version: mix.templateVersion,
        mix: shares.map((share) => `${share.level} ${share.percent}%`).join(" · "),
      })}
    </p>
    <Button size="sm" variant="ghost" onClick={onSingleLevel}>
      {messages.mixSingleLevel}
    </Button>
  </div>
);
