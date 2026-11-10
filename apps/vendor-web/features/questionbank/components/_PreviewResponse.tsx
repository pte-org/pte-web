import type { ReactElement } from "react";
import { EXAM_SCREEN_SPEAKING_SECTION, EXAM_SCREEN_TEXT } from "../examScreenPreviewConstants";
import type { PreviewTiming, QuestionPreviewDraft } from "../types";
import { PreviewAudioPanel } from "./_PreviewAudioPanel";

interface PreviewResponseProps {
  draft: QuestionPreviewDraft;
  timing: PreviewTiming | null;
}

const wordLimit = (min: number | null, max: number | null): string | null => {
  if (min !== null && max !== null)
    return EXAM_SCREEN_TEXT.WORD_RANGE.replace("{min}", String(min)).replace("{max}", String(max));
  if (min !== null) return EXAM_SCREEN_TEXT.MIN_ONLY.replace("{min}", String(min));
  if (max !== null) return EXAM_SCREEN_TEXT.MAX_ONLY.replace("{max}", String(max));
  return null;
};

/** The answering control the student gets: choices, a typed answer with a counter, or the recorder. */
export const PreviewResponse = ({ draft, timing }: PreviewResponseProps): ReactElement | null => {
  if (draft.options.length > 0) {
    const inputType = draft.multipleChoice ? "checkbox" : "radio";
    return (
      <ul className="space-y-2">
        {draft.options.map((option, index) => (
          // Options are positional and only appended or edited in place while typing.
          <li key={index}>
            <label className="flex items-start gap-3 rounded-sm border border-[var(--exam-border-subtle)] px-4 py-3 text-lg text-[var(--exam-text)]">
              <input
                className="mt-1.5 accent-[var(--exam-primary)]"
                type={inputType}
                name="preview-option"
                disabled
              />
              <span>{option || EXAM_SCREEN_TEXT.OPTION_FALLBACK}</span>
            </label>
          </li>
        ))}
      </ul>
    );
  }
  if (draft.needsWordCount) {
    const limit = wordLimit(draft.minWordCount, draft.maxWordCount);
    return (
      <div className="space-y-2">
        <textarea
          className="h-60 w-full resize-none rounded-sm border border-[var(--exam-border)] bg-[var(--exam-surface)] p-4 text-lg text-[var(--exam-text)] placeholder:text-[var(--exam-text-muted)]"
          placeholder={EXAM_SCREEN_TEXT.TYPE_HERE}
          disabled
        />
        <p className="text-sm text-[var(--exam-text-secondary)]">
          {EXAM_SCREEN_TEXT.WORD_COUNT}: 0{limit ? ` · ${limit}` : ""}
        </p>
      </div>
    );
  }
  if (draft.section === EXAM_SCREEN_SPEAKING_SECTION) {
    return <PreviewAudioPanel variant="recorder" totalSeconds={timing?.responseSeconds ?? null} />;
  }
  return null;
};
