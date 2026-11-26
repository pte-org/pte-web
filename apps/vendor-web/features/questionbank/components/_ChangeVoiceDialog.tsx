"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type QuestionResponse } from "@pte/api-client";
import { Alert, Button, Modal, useLocale, useToast } from "@pte/ui";
import { useVoiceSamplePlayer } from "../hooks/useVoiceSamplePlayer";
import { useChangeVoice, useVoiceCatalog } from "../voiceApi";
import { VOICE_TEXT } from "../voiceConstants";
import { currentVoiceOf, groupVoices } from "../voiceGroups";
import { VoiceOptionRow } from "./_VoiceOptionRow";

interface ChangeVoiceDialogProps {
  question: QuestionResponse;
  open: boolean;
  onClose: () => void;
}

/** Pick another voice for a draft question, hear each one first, and have the audio made again. */
export const ChangeVoiceDialog = ({
  question,
  open,
  onClose,
}: ChangeVoiceDialogProps): ReactElement => {
  const { locale } = useLocale();
  const T = VOICE_TEXT[locale === "vi" ? "vi" : "en"];
  const { showToast } = useToast();
  const catalog = useVoiceCatalog(open);
  const change = useChangeVoice(question.publicId);
  const sample = useVoiceSamplePlayer();
  const current = currentVoiceOf(question);
  const [chosen, setChosen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accentLabel = { US: T.ACCENT_US, UK: T.ACCENT_UK } as const;
  const genderLabel = { FEMALE: T.GENDER_FEMALE, MALE: T.GENDER_MALE } as const;

  const apply = (): void => {
    if (!chosen || question.version === undefined) return;
    setError(null);
    change.mutate(
      { voice: chosen, version: question.version },
      {
        onSuccess: () => {
          showToast(T.CHANGED, { tone: "success" });
          onClose();
        },
        onError: (failure) => setError(getUserFacingApiErrorMessage(failure, T.CHANGE_ERROR)),
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.DIALOG_TITLE}
      size="lg"
      isDismissDisabled={change.isPending}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" appearance="outline" disabled={change.isPending} onClick={onClose}>
            {T.CANCEL}
          </Button>
          <Button
            isLoading={change.isPending}
            loadingText={T.APPLYING}
            disabled={!chosen || chosen === current}
            onClick={apply}
          >
            {T.APPLY}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--ink-secondary)]">{T.DIALOG_HINT}</p>
        {catalog.isError && <Alert tone="error">{T.CATALOG_ERROR}</Alert>}
        {sample.failed && <Alert tone="error">{T.LISTEN_ERROR}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}
        {change.isPending && (
          <p className="text-sm text-[var(--ink-muted)]">{T.WORKING_NOTE}</p>
        )}
        {groupVoices(catalog.data?.voices ?? []).map((group) => (
          <section key={group.accent} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
              {accentLabel[group.accent]}
            </h3>
            {group.genders.map(({ gender, voices }) => (
              <div key={gender} className="flex flex-col gap-2">
                <span className="text-xs font-medium text-[var(--ink-muted)]">
                  {genderLabel[gender]}
                </span>
                {voices.map((voice) => (
                  <VoiceOptionRow
                    key={voice.code}
                    voice={voice}
                    checked={chosen === voice.code}
                    isCurrent={voice.code === current}
                    currentLabel={T.CURRENT_VOICE}
                    listenLabel={T.LISTEN}
                    listenLoadingLabel={T.LISTEN_LOADING}
                    isListening={sample.loadingVoice === voice.code}
                    disabled={change.isPending}
                    onChoose={() => setChosen(voice.code)}
                    onListen={() => sample.play(voice.code)}
                  />
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    </Modal>
  );
};
