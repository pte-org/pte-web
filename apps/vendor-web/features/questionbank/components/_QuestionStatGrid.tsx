import type { ReactElement } from "react";
import {
  BookOpenIcon,
  ClipboardIcon,
  DocumentIcon,
  HeadphoneIcon,
  StatCard,
} from "@aptis/ui";
import { QUESTIONBANK_TEXT } from "../constants";
import type { QuestionStats } from "../types";

interface QuestionStatGridProps {
  stats?: QuestionStats;
}

export const QuestionStatGrid = ({
  stats,
}: QuestionStatGridProps): ReactElement => (
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
      label={QUESTIONBANK_TEXT.STAT_DRAFT}
      value={stats?.draft ?? "—"}
      footnote={stats?.draftNote}
      icon={<DocumentIcon />}
      highlight
    />
  </div>
);
