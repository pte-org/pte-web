"use client";

import type { ReactElement } from "react";
import type { QuestionGenerationBatchQuestion } from "@pte/api-client";
import { cn } from "@pte/ui";
import { usePromptMedia } from "@/features/questionbank/hooks/usePromptMediaUrl";
import type { BatchMessages } from "../messages/en";
import { previewKind } from "../utils/batchResults";

interface QuestionPreviewProps {
  slot: QuestionGenerationBatchQuestion;
  messages: BatchMessages;
}

const WAVE_BARS = 32;
const WAVE_HEIGHTS = [
  "h-2",
  "h-3",
  "h-4",
  "h-5",
  "h-6",
  "h-7",
  "h-8",
  "h-9",
  "h-10",
  "h-11",
  "h-12",
] as const;
const SECONDS_PER_MINUTE = 60;
const OPTION_LETTERS = "ABCDEFGH";

/** A fixed, speech-like shape per question, so a card's wave does not change between polls. */
const waveLevel = (bar: number, seed: number): number =>
  Math.abs(Math.sin(bar * 1.7 + seed) * Math.cos(bar * 0.41 + seed * 0.3));

const seedOf = (id: string): number =>
  [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97;

const duration = (seconds: number): string =>
  `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(Math.round(seconds % SECONDS_PER_MINUTE)).padStart(2, "0")}`;

const Caption = ({ children }: { children: string }): ReactElement => (
  <p className="mb-1.5 text-[11px] text-[var(--ink-muted)]">{children}</p>
);

const ImagePreview = ({ imageRef }: { imageRef: string }): ReactElement | null => {
  const { url } = usePromptMedia(imageRef);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a signed preview address, not a static asset
    <img
      src={url}
      alt=""
      className="mx-auto max-h-20 rounded border border-[var(--border-subtle)]"
    />
  );
};

/** The top of a result card: the start of the prompt, the options, the sound or the picture of the question. */
export const QuestionPreview = ({ slot, messages }: QuestionPreviewProps): ReactElement => {
  const kind = previewKind(slot);
  if (kind === "image" && slot.imageRef) {
    return (
      <>
        <Caption>
          {slot.chartType ? `${messages.previewImage} · ${slot.chartType}` : messages.previewImage}
        </Caption>
        <ImagePreview imageRef={slot.imageRef} />
      </>
    );
  }
  if (kind === "options") {
    return (
      <>
        <Caption>{messages.previewOptions}</Caption>
        <ul className="space-y-1 text-[11px] text-[var(--ink-secondary)]">
          {slot.options.map((option, index) => (
            <li
              key={index}
              className={cn(
                "truncate rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-1.5 py-0.5",
                index === slot.correctOptionIndex && "border-emerald-500/50 bg-emerald-500/10",
              )}
            >
              {`${OPTION_LETTERS[index] ?? ""}. ${option}`}
            </li>
          ))}
        </ul>
      </>
    );
  }
  if (kind === "audio") {
    const seed = seedOf(slot.questionPublicId ?? slot.jobPublicId);
    return (
      <>
        <Caption>
          {slot.voice
            ? `${messages.previewAudio} · ${messages.voiceLabel.replace("{voice}", slot.voice)}`
            : messages.previewAudio}
        </Caption>
        <div className="flex h-14 items-center gap-0.5" aria-hidden>
          {Array.from({ length: WAVE_BARS }, (_, bar) => (
            <span
              key={bar}
              className={cn(
                "flex-1 rounded-sm bg-violet-500/80",
                WAVE_HEIGHTS[Math.round(waveLevel(bar, seed) * (WAVE_HEIGHTS.length - 1))],
              )}
            />
          ))}
        </div>
        {slot.audioSeconds !== null && (
          <span className="absolute bottom-2 right-2 rounded border border-[var(--border-subtle)] bg-[var(--surface-card)] px-1.5 text-[11px] tabular-nums text-[var(--ink-secondary)]">
            {duration(slot.audioSeconds)}
          </span>
        )}
      </>
    );
  }
  return (
    <>
      <Caption>{messages.previewPrompt}</Caption>
      <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">{slot.promptExcerpt}</p>
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-linear-to-b from-transparent to-[var(--surface-subtle)]" />
    </>
  );
};
