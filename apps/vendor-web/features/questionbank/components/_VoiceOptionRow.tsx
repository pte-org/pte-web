"use client";

import type { ReactElement } from "react";
import { Button, RadioCard } from "@pte/ui";
import type { QuestionVoiceOption } from "@pte/api-client";
import { VOICE_RADIO_GROUP_NAME } from "../voiceConstants";

interface VoiceOptionRowProps {
  voice: QuestionVoiceOption;
  checked: boolean;
  isCurrent: boolean;
  currentLabel: string;
  listenLabel: string;
  listenLoadingLabel: string;
  isListening: boolean;
  disabled: boolean;
  onChoose: () => void;
  onListen: () => void;
}

/** One voice: its name (marked when it is the question's voice now), a way to hear it and the choice itself. */
export const VoiceOptionRow = ({
  voice,
  checked,
  isCurrent,
  currentLabel,
  listenLabel,
  listenLoadingLabel,
  isListening,
  disabled,
  onChoose,
  onListen,
}: VoiceOptionRowProps): ReactElement => (
  <div className="flex items-stretch gap-2">
    <RadioCard
      className="flex-1"
      name={VOICE_RADIO_GROUP_NAME}
      label={voice.label}
      hint={isCurrent ? currentLabel : undefined}
      checked={checked}
      disabled={disabled}
      onChange={onChoose}
    />
    <Button
      size="sm"
      variant="secondary"
      appearance="outline"
      disabled={disabled || isListening}
      onClick={onListen}
    >
      {isListening ? listenLoadingLabel : listenLabel}
    </Button>
  </div>
);
