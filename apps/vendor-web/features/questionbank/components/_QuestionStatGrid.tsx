"use client";

import { useState, type ReactElement } from "react";
import {
  BookOpenIcon,
  ClipboardIcon,
  DocumentIcon,
  HeadphoneIcon,
  MicIcon,
  PencilIcon,
  StatCard,
} from "@pte/ui";
import { QUESTIONBANK_TEXT } from "../constants";
import type { QuestionStats } from "../types";

interface QuestionStatGridProps {
  stats?: QuestionStats;
}

export const QuestionStatGrid = ({ stats }: QuestionStatGridProps): ReactElement => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section
      aria-labelledby="question-overview-title"
      className="flex flex-col gap-3 lg:mx-10"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="question-overview-title" className="text-sm font-semibold text-slate-800">
            Overview
          </h2>
          <p className="mt-1 text-xs text-slate-500">Question inventory at a glance.</p>
        </div>
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls="question-overview-cards"
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-action shadow-sm transition-colors hover:border-action hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action focus-visible:ring-offset-2"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? "Collapse" : "Expand"}
          <span aria-hidden="true" className="text-base leading-none">
            {isExpanded ? "−" : "+"}
          </span>
        </button>
      </div>

      {isExpanded && (
        <div
          id="question-overview-cards"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StatCard
            compact
            label={QUESTIONBANK_TEXT.STAT_TOTAL}
            value={stats?.total ?? "—"}
            trend={stats?.totalTrend}
            icon={<ClipboardIcon />}
          />
          <StatCard
            compact
            label={QUESTIONBANK_TEXT.STAT_LISTENING}
            value={stats?.listening ?? "—"}
            footnote={stats?.listeningNote}
            icon={<HeadphoneIcon />}
          />
          <StatCard
            compact
            label={QUESTIONBANK_TEXT.STAT_READING}
            value={stats?.reading ?? "—"}
            footnote={stats?.readingNote}
            icon={<BookOpenIcon />}
          />
          <StatCard
            compact
            label={QUESTIONBANK_TEXT.STAT_DRAFT}
            value={stats?.draft ?? "—"}
            footnote={stats?.draftNote}
            icon={<DocumentIcon />}
            highlight
          />
          <StatCard
            compact
            label={QUESTIONBANK_TEXT.STAT_WRITING}
            value={stats?.writing ?? "—"}
            footnote={stats?.writingNote}
            icon={<PencilIcon />}
          />
          <StatCard
            compact
            label={QUESTIONBANK_TEXT.STAT_SPEAKING}
            value={stats?.speaking ?? "—"}
            footnote={stats?.speakingNote}
            icon={<MicIcon />}
          />
        </div>
      )}
    </section>
  );
};
