"use client";

import { useMemo, type ReactElement } from "react";
import type { QuestionGenerationLiveCheck } from "@pte/api-client";
import { cn } from "@pte/ui";
import { ACTIVITY_TICK_MS, BRIEF_STEP_MS, type AssemblyText } from "../assemblyConstants";
import { useTicker } from "../hooks/useTicker";
import { CHECK_COPY } from "../liveCheckCopy";
import { writingBrief } from "../utils/writingBrief";

interface WritingBriefProps {
  checks: readonly QuestionGenerationLiveCheck[];
  locale: "vi" | "en";
  text: AssemblyText;
}

/**
 * The brief the writer sent to the model, shown while the model has not answered yet (a provider may hold its whole
 * answer back until it is done). The agent's cursor goes over it line by line and topic by topic, with the time
 * waited so far. Every line is what the server reported for this round's prompt.
 */
export const WritingBriefCard = ({ checks, locale, text }: WritingBriefProps): ReactElement => {
  const tick = useTicker(ACTIVITY_TICK_MS);
  const brief = useMemo(() => writingBrief(checks, CHECK_COPY[locale]), [checks, locale]);
  const elapsedMs = tick * ACTIVITY_TICK_MS;
  const stops = brief.lines.length + brief.avoided.length;
  const at = stops > 0 ? Math.floor(elapsedMs / BRIEF_STEP_MS) % stops : -1;
  return (
    <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3 py-2">
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
        {brief.lines.map((line, index) => (
          <div key={line.key} className="contents">
            <dt className="text-[var(--ink-muted)]">{line.label}</dt>
            <dd
              data-cursor-target={index === at ? line.key : undefined}
              className={cn(
                "m-0 min-w-0 truncate rounded px-1 transition-colors duration-300",
                index === at && "bg-[var(--action)]/10 text-[var(--ink-primary)]",
              )}
            >
              {line.value}
            </dd>
          </div>
        ))}
      </dl>
      {brief.avoided.length > 0 && (
        <div className="mt-2">
          <p className="mb-1 text-xs text-[var(--ink-muted)]">{text.avoidTopics}</p>
          <div className="flex flex-wrap gap-1">
            {brief.avoided.map((topic, index) => {
              const current = brief.lines.length + index === at;
              return (
                <span
                  key={topic}
                  data-cursor-target={current ? `avoid-${index}` : undefined}
                  className={cn(
                    "rounded-full bg-[var(--surface-card)] px-2 py-0.5 text-[11px] text-[var(--ink-muted)] line-through transition-shadow duration-300",
                    current && "ring-2 ring-[var(--action)]/30",
                  )}
                >
                  {topic}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
