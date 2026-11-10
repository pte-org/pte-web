"use client";

import type { ReactElement } from "react";
import { cn } from "@pte/ui";
import type { LiveText } from "../liveConstants";
import type { ReviewSummary } from "../utils/reviewSummary";
import { humanizeKey } from "../utils/draftFields";
import { WritingCursor } from "./_LiveLaneCard";

interface LiveReviewBodyProps {
  summary: ReviewSummary;
  labels: Record<string, string>;
  text: LiveText;
  writing: boolean;
}

/** The reviewer's checks one by one as it writes them, then its verdict and what to fix. */
export const LiveReviewBody = ({ summary, labels, text, writing }: LiveReviewBodyProps): ReactElement => (
  <div className="space-y-2 text-sm">
    {summary.checks.map((check) => (
      <div key={check.key} className="flex gap-2">
        <span className={cn("mt-0.5 font-bold", check.ok === false ? "text-red-600" : "text-emerald-600")}>
          {check.ok === null ? "…" : check.ok ? "✓" : "✗"}
        </span>
        <div>
          <span className="font-medium">{labels[check.key] ?? humanizeKey(check.key)}</span>
          {check.estimated && (
            <span className="ml-2 text-xs text-[var(--ink-muted)]">{text.estimated} {check.estimated}</span>
          )}
          {check.note && <p className="text-[var(--ink-secondary)]">{check.note}</p>}
        </div>
      </div>
    ))}
    {summary.fixSuggestion && (
      <p className="rounded-md bg-red-500/10 px-2 py-1">
        <span className="font-semibold">{text.fixSuggestion}: </span>
        {summary.fixSuggestion}
      </p>
    )}
    {summary.verdict && (
      <p className={cn("font-semibold", summary.verdict === "PASS" ? "text-emerald-600" : "text-red-600")}>
        {summary.verdict === "PASS" ? text.verdictPass : text.verdictFail}
      </p>
    )}
    {writing && <WritingCursor lane="REVIEWER" />}
  </div>
);
