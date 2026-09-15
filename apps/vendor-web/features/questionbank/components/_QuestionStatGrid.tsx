import type { ReactElement } from "react";
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

// PTE has 4 skills (Speaking/Writing/Reading/Listening) — the original design
// only surfaced Listening/Reading + Total/Draft. 6 cards still reads fine on
// this grid: lg:grid-cols-4 just wraps to a second row of 2 instead of 4.
export const QuestionStatGrid = ({ stats }: QuestionStatGridProps): ReactElement => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard
      label={QUESTIONBANK_TEXT.STAT_TOTAL}
      value={stats?.total ?? "—"}
      trend={stats?.totalTrend}
      icon={<ClipboardIcon />}
    />
    <StatCard
      label={QUESTIONBANK_TEXT.STAT_LISTENING}
      value={stats?.listening ?? "—"}
      footnote={stats?.listeningNote}
      icon={<HeadphoneIcon />}
    />
    <StatCard
      label={QUESTIONBANK_TEXT.STAT_READING}
      value={stats?.reading ?? "—"}
      footnote={stats?.readingNote}
      icon={<BookOpenIcon />}
    />
    <StatCard
      label={QUESTIONBANK_TEXT.STAT_WRITING}
      value={stats?.writing ?? "—"}
      footnote={stats?.writingNote}
      icon={<PencilIcon />}
    />
    <StatCard
      label={QUESTIONBANK_TEXT.STAT_SPEAKING}
      value={stats?.speaking ?? "—"}
      footnote={stats?.speakingNote}
      icon={<MicIcon />}
    />
    <StatCard
      label={QUESTIONBANK_TEXT.STAT_DRAFT}
      value={stats?.draft ?? "—"}
      footnote={stats?.draftNote}
      icon={<DocumentIcon />}
      highlight
    />
  </div>
);
