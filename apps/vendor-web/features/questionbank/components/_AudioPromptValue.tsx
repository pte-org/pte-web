"use client";

import { useState, type ReactElement } from "react";
import { Button, useLocale } from "@pte/ui";
import type { QuestionResponse } from "@pte/api-client";
import { useVoiceCatalog } from "../voiceApi";
import { VOICE_TEXT } from "../voiceConstants";
import { canChangeVoice } from "../voiceGroups";
import { ChangeVoiceDialog } from "./_ChangeVoiceDialog";

interface AudioPromptValueProps {
  question: QuestionResponse;
  /** The playable address of the audio, null when the file could not be loaded. */
  audioUrl: string | null;
  audioLabel: string;
}

/** The prompt audio of a question: the player (or the file id when it cannot play) and, for drafts, a way to change its voice. */
export const AudioPromptValue = ({
  question,
  audioUrl,
  audioLabel,
}: AudioPromptValueProps): ReactElement => {
  const { locale } = useLocale();
  const T = VOICE_TEXT[locale === "vi" ? "vi" : "en"];
  const { data: catalog } = useVoiceCatalog(question.status === "DRAFT");
  const [open, setOpen] = useState(false);
  const canChange = canChangeVoice(question, catalog);
  return (
    <div className="flex flex-col gap-2">
      {audioUrl ? (
        <audio className="w-full max-w-md" controls preload="metadata" src={audioUrl} aria-label={audioLabel} />
      ) : (
        <span className="break-all font-mono text-xs">{question.audioPromptRef}</span>
      )}
      {canChange && (
        <div>
          <Button size="sm" variant="secondary" appearance="outline" onClick={() => setOpen(true)}>
            {T.CHANGE_VOICE}
          </Button>
          {open && <ChangeVoiceDialog question={question} open={open} onClose={() => setOpen(false)} />}
        </div>
      )}
    </div>
  );
};
