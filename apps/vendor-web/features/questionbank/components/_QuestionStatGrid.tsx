import type { ReactElement } from "react";
import {
  BookOpenIcon,
  ClipboardIcon,
  CollapsibleSection,
  DocumentIcon,
  HeadphoneIcon,
  MicIcon,
  PencilIcon,
  StatCard,
} from "@pte/ui";
import { QUESTIONBANK_OVERVIEW_TEXT, QUESTIONBANK_TEXT } from "../constants";
import type { QuestionStats } from "../types";

interface QuestionStatGridProps {
  stats?: QuestionStats;
}

export const QuestionStatGrid = ({ stats }: QuestionStatGridProps): ReactElement => (
  <CollapsibleSection
    title={QUESTIONBANK_OVERVIEW_TEXT.TITLE}
    subtitle={QUESTIONBANK_OVERVIEW_TEXT.SUBTITLE}
    className="lg:mx-10"
    contentClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
  >
    <StatCard
      compact
      label={QUESTIONBANK_TEXT.STAT_TOTAL}
      value={stats?.total ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
      trend={stats?.totalTrend}
      icon={<ClipboardIcon />}
    />
    <StatCard
      compact
      label={QUESTIONBANK_TEXT.STAT_LISTENING}
      value={stats?.listening ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
      footnote={stats?.listeningNote}
      icon={<HeadphoneIcon />}
    />
    <StatCard
      compact
      label={QUESTIONBANK_TEXT.STAT_READING}
      value={stats?.reading ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
      footnote={stats?.readingNote}
      icon={<BookOpenIcon />}
    />
    <StatCard
      compact
      label={QUESTIONBANK_TEXT.STAT_DRAFT}
      value={stats?.draft ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
      footnote={stats?.draftNote}
      icon={<DocumentIcon />}
      highlight
    />
    <StatCard
      compact
      label={QUESTIONBANK_TEXT.STAT_WRITING}
      value={stats?.writing ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
      footnote={stats?.writingNote}
      icon={<PencilIcon />}
    />
    <StatCard
      compact
      label={QUESTIONBANK_TEXT.STAT_SPEAKING}
      value={stats?.speaking ?? QUESTIONBANK_OVERVIEW_TEXT.EMPTY_VALUE}
      footnote={stats?.speakingNote}
      icon={<MicIcon />}
    />
  </CollapsibleSection>
);
