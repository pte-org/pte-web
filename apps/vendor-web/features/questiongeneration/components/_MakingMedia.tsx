"use client";

import type { ReactElement, ReactNode } from "react";
import { cn } from "@pte/ui";
import {
  ACTIVITY_TICK_MS,
  CHART_REPLAY_MS,
  MEDIA_FILL_CAP,
  MEDIA_FILL_SECONDS,
  WAVE_BARS,
  type AssemblyText,
} from "../assemblyConstants";
import { useTicker } from "../hooks/useTicker";
import { usePromptMedia } from "@/features/questionbank/hooks/usePromptMediaUrl";
import { chartFacts } from "../utils/chartFacts";

interface MakingMediaProps {
  kind: "audio" | "image";
  /** The writer's draft, whose chart type and size are shown beside the image. */
  typed: unknown;
  text: AssemblyText;
  /** The media already exists and is replayed: the drawing fills completely in a fixed time. */
  replay?: boolean;
  /** The real image being revealed during a replay. */
  mediaRef?: string | null;
}

/** Heights as classes, so the drawing stays in Tailwind; a bar picks the step nearest its level. */
const WAVE_HEIGHTS = [
  "h-1",
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
/** Width of the cover still hiding the image, from all of it to none, so the reveal stays in Tailwind classes. */
const COVER_WIDTHS = [
  "w-full",
  "w-11/12",
  "w-5/6",
  "w-3/4",
  "w-2/3",
  "w-7/12",
  "w-1/2",
  "w-5/12",
  "w-1/3",
  "w-1/4",
  "w-1/6",
  "w-1/12",
  "w-0",
] as const;
const TICKS_PER_SECOND = 1000 / ACTIVITY_TICK_MS;

const pick = <T,>(heights: readonly T[], level: number): T =>
  heights[Math.max(0, Math.min(heights.length - 1, Math.round(level * (heights.length - 1))))] as T;

/** A fixed, speech-like level per bar, so the wave keeps its shape as it grows. */
const speechLevel = (bar: number): number =>
  Math.min(1, 0.15 + Math.abs(Math.sin(bar * 1.9) * Math.cos(bar * 0.37)) * 0.85);

const Stat = ({ label, children }: { label: string; children: ReactNode }): ReactElement => (
  <div className="rounded-md bg-[var(--surface-subtle)] px-2.5 py-1.5 text-xs text-[var(--ink-muted)]">
    {label}
    <b className="block text-[13px] text-[var(--ink-primary)]">{children}</b>
  </div>
);

/**
 * The audio or image being made: a sound wave growing left to right while Kokoro reads, or the real image revealed
 * left to right once it exists. The agent's cursor sits on the edge being drawn (`data-cursor-target`). The time
 * it takes is unknown, so the drawing nears its end without reaching it; the piece completes when the media arrives.
 */
/**
 * The real image uncovered left to right as `fill` grows, the agent's cursor on the edge of the cover. Before the
 * image exists there is only an empty frame: nothing is drawn that the image will not show.
 */
const RevealedImage = ({
  mediaRef,
  fill,
}: {
  mediaRef: string | null;
  fill: number;
}): ReactElement => {
  const { url } = usePromptMedia(mediaRef);
  const cover = COVER_WIDTHS[Math.round(fill * (COVER_WIDTHS.length - 1))];
  return (
    <div className="relative mx-3 my-3 flex h-40 items-center justify-center overflow-hidden rounded-md border border-dashed border-[var(--border-subtle)]">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- a signed preview address, not a static asset
        <img src={url} alt="" className="max-h-full max-w-full object-contain" />
      )}
      <span
        className={cn(
          "absolute inset-y-0 right-0 bg-[var(--surface-card)] transition-all duration-300",
          url ? cover : "w-full",
        )}
      >
        <span
          data-cursor-target="reveal-edge"
          className="absolute inset-y-0 left-0 w-0.5 bg-amber-500/70"
        />
      </span>
    </div>
  );
};

export const MakingMedia = ({
  kind,
  typed,
  text,
  replay,
  mediaRef,
}: MakingMediaProps): ReactElement => {
  const tick = useTicker(ACTIVITY_TICK_MS);
  const seconds = tick / TICKS_PER_SECOND;
  const fill = replay
    ? Math.min(1, (seconds * 1000) / CHART_REPLAY_MS)
    : Math.min(MEDIA_FILL_CAP, 1 - Math.exp(-seconds / MEDIA_FILL_SECONDS));
  const elapsed = text.seconds.replace("{s}", String(Math.floor(seconds)));
  if (kind === "audio") {
    const drawn = Math.max(1, Math.floor(fill * WAVE_BARS));
    return (
      <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <p className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs text-[var(--ink-muted)]">
          {text.ttsReading}
        </p>
        <div className="flex h-16 items-center gap-0.5 px-3" aria-hidden>
          {Array.from({ length: WAVE_BARS }, (_, bar) => (
            <span
              key={bar}
              data-cursor-target={bar === drawn - 1 ? `wave-${bar}` : undefined}
              className={cn(
                "flex-1 rounded-sm transition-all duration-500",
                bar < drawn
                  ? cn("bg-violet-600", pick(WAVE_HEIGHTS, speechLevel(bar)))
                  : "h-1 bg-[var(--surface-subtle)]",
              )}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <Stat label={text.elapsed}>{elapsed}</Stat>
          <Stat label={text.check}>{text.checking}</Stat>
        </div>
      </div>
    );
  }
  const facts = chartFacts(typed);
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
      <p className="border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-1.5 text-xs text-[var(--ink-muted)]">
        {facts.chartType ? text.chartDrawing : text.imageDrawing}
      </p>
      <RevealedImage mediaRef={replay ? (mediaRef ?? null) : null} fill={fill} />
      <div className="grid grid-cols-3 gap-2 px-3 pb-3">
        {facts.chartType ? (
          <>
            <Stat label={text.chartTypeLabel}>{facts.chartType}</Stat>
            <Stat label={text.bars}>{String(facts.categories)}</Stat>
            <Stat label={text.seriesLabel}>{String(facts.series)}</Stat>
          </>
        ) : (
          <>
            <Stat label={text.elapsed}>{elapsed}</Stat>
            <Stat label={text.check}>{text.checking}</Stat>
          </>
        )}
      </div>
    </div>
  );
};
