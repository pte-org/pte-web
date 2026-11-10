import type { ReactElement } from "react";
import { EXAM_SCREEN_TEXT } from "../examScreenPreviewConstants";
import type { QuestionPreviewDraft } from "../types";
import { PreviewAudioPanel } from "./_PreviewAudioPanel";

/** What the student reads, sees and hears before answering: audio player, image, prompt text. */
export const PreviewStimulus = ({ draft }: { draft: QuestionPreviewDraft }): ReactElement => {
  const { expectsImage, expectsAudio } = draft;
  const hasText = draft.promptText.trim().length > 0;
  return (
    <div className="space-y-6">
      {expectsAudio && <PreviewAudioPanel variant="player" src={draft.audioUrl} />}
      {expectsImage &&
        (draft.imageUrl ? (
          <img
            className="mx-auto max-h-80 w-full object-contain"
            src={draft.imageUrl}
            alt={EXAM_SCREEN_TEXT.IMAGE_ALT}
          />
        ) : (
          <p className="rounded-sm border border-dashed border-[var(--exam-border)] p-8 text-center text-sm text-[var(--exam-text-muted)]">
            {EXAM_SCREEN_TEXT.EMPTY_IMAGE}
          </p>
        ))}
      {hasText ? (
        <p className="whitespace-pre-line text-xl leading-relaxed text-[var(--exam-text)]">
          {draft.promptText}
        </p>
      ) : (
        !expectsImage &&
        !expectsAudio && (
          <p className="text-sm text-[var(--exam-text-muted)]">{EXAM_SCREEN_TEXT.EMPTY_PROMPT}</p>
        )
      )}
    </div>
  );
};
