"use client";

import { useState, type ReactElement } from "react";
import { cn } from "@pte/ui";
import {
  ACTIVITY_TICK_MS,
  THINKING_VISIBLE_CHARS,
  type AssemblyText,
} from "../assemblyConstants";
import { useTicker } from "../hooks/useTicker";
import type { LiveThinking } from "../utils/liveThinking";

interface ThinkingPadProps {
  thinking: LiveThinking;
  locale: "vi" | "en";
  text: AssemblyText;
}

const MS_PER_SECOND = 1000;

const Thoughts = ({ value, live }: { value: string; live: boolean }): ReactElement => (
  <div
    className={cn("relative overflow-hidden px-3 pb-2", live ? "h-24" : "max-h-48 overflow-y-auto")}
  >
    <p
      className={cn(
        "whitespace-pre-wrap font-mono text-[11px] leading-snug text-[var(--ink-muted)]",
        live && "absolute inset-x-3 bottom-2",
      )}
    >
      {value.slice(-THINKING_VISIBLE_CHARS)}
      {live && (
        <span
          data-caret
          className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-current align-middle"
        />
      )}
    </p>
    {live && (
      <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-linear-to-b from-[var(--surface-subtle)] to-transparent" />
    )}
  </div>
);

/**
 * The agent's train of thought while a reasoning model thinks before it writes: its latest lines scroll by on a
 * scratch pad, with the time and the amount so far. Once the answer starts the pad folds into one line that opens
 * the thoughts again. The text is the model's own, streamed by the server, never made up here.
 */
export const ThinkingPad = ({ thinking, locale, text }: ThinkingPadProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const tick = useTicker(ACTIVITY_TICK_MS);
  const chars = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(thinking.chars);
  if (thinking.answering) {
    return (
      <div className="text-xs text-[var(--ink-muted)]">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="hover:text-[var(--ink-primary)]"
        >
          {text.thoughtDone.replace("{n}", chars)} {open ? "▾" : "▸"}
        </button>
        {open && (
          <div className="mt-1 rounded-md bg-[var(--surface-subtle)] pt-2">
            <Thoughts value={thinking.text} live={false} />
          </div>
        )}
      </div>
    );
  }
  const seconds = Math.floor((tick * ACTIVITY_TICK_MS) / MS_PER_SECOND);
  return (
    <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-subtle)]">
      <p className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--ink-muted)]">
        <span className="flex gap-0.5">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="h-1 w-1 animate-bounce rounded-full bg-current" />
          ))}
        </span>
        {text.thinkingNow}
        <span className="font-normal">
          {text.thinkingStats.replace("{s}", String(seconds)).replace("{n}", chars)}
        </span>
      </p>
      {/* The replay holds thoughts back until they have kept coming for a while (see viewOf), so only real streaming scrolls. */}
      <Thoughts value={thinking.text} live />
    </div>
  );
};
