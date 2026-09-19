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
import { QUESTIONBANK_TEXT } from "../constants";
import type { QuestionStats } from "../types";

interface QuestionStatGridProps {
  stats?: QuestionStats;
}

export const QuestionStatGrid = ({ stats }: QuestionStatGridProps): ReactElement => (
  <CollapsibleSection
    title="Overview"
    subtitle="Question inventory at a glance."
    className="lg:mx-10"
    contentClassName="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
  </CollapsibleSection>
);
