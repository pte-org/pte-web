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
import {
  QUESTIONBANK_OVERVIEW_TEXT,
  QUESTIONBANK_TEXT as RAW_QUESTIONBANK_TEXT,
} from "../constants";
import type { QuestionStats } from "../types";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface QuestionStatGridProps {
  stats?: QuestionStats;
}

export const QuestionStatGrid = ({ stats }: QuestionStatGridProps): ReactElement => {
  const T = useAdminCopy(RAW_QUESTIONBANK_TEXT);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:mx-10">
      <StatCard
        compact
        label={T.STAT_TOTAL}
        value={stats?.total ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
        trend={stats?.totalTrend}
        icon={<ClipboardIcon />}
      />
      <StatCard
        compact
        label={T.STAT_LISTENING}
        value={stats?.listening ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
        footnote={stats?.listeningNote}
        icon={<HeadphoneIcon />}
      />
      <StatCard
        compact
        label={T.STAT_READING}
        value={stats?.reading ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
        footnote={stats?.readingNote}
        icon={<BookOpenIcon />}
      />
      <StatCard
        compact
        label={T.STAT_DRAFT}
        value={stats?.draft ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
        footnote={stats?.draftNote}
        icon={<DocumentIcon />}
        highlight
      />
      <StatCard
        compact
        label={T.STAT_WRITING}
        value={stats?.writing ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
        footnote={stats?.writingNote}
        icon={<PencilIcon />}
      />
      <StatCard
        compact
        label={T.STAT_SPEAKING}
        value={stats?.speaking ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
        footnote={stats?.speakingNote}
        icon={<MicIcon />}
      />
    </div>
  );
};
