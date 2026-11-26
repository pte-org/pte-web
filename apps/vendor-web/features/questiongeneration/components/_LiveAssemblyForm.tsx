import type { ReactElement } from "react";
import Link from "next/link";
import type { QuestionGenerationLiveCheck } from "@pte/api-client";
import { Chip } from "@pte/ui";
import type { AssemblyText } from "../assemblyConstants";
import type { LiveLane } from "../liveConstants";
import type { DropState } from "../replay";
import type { ActivePiece, LivePiece as Piece, PieceKey } from "../utils/livePieces";
import type { ReviewSummary } from "../utils/reviewSummary";
import { LivePiece } from "./_LivePiece";
import type { LiveThinking } from "../utils/liveThinking";

interface LiveAssemblyFormProps {
  pieces: Piece[];
  active: ActivePiece | null;
  drops: DropState;
  taskType: string;
  section: string;
  stageLabel: string;
  laneLabels: Record<LiveLane, string>;
  text: AssemblyText;
  checks: readonly QuestionGenerationLiveCheck[];
  review: ReviewSummary;
  locale: "vi" | "en";
  saved: { href: string; label: string } | null;
  typed: unknown;
  thinking: LiveThinking | null;
}

const CARD =
  "flex flex-col gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-card";
const GROUPS: { title: keyof AssemblyText; keys: PieceKey[] }[] = [
  { title: "contentTitle", keys: ["prompt", "visual", "audio", "image"] },
  { title: "optionsTitle", keys: ["options"] },
  { title: "answerTitle", keys: ["reference", "transcript"] },
  { title: "hintTitle", keys: ["hintVi", "hintEn"] },
];
const LABEL_OF: Record<PieceKey, keyof AssemblyText> = {
  prompt: "promptLabel",
  visual: "visualLabel",
  audio: "audioLabel",
  image: "imageLabel",
  options: "optionsTitle",
  reference: "referenceLabel",
  transcript: "transcriptLabel",
  hintVi: "hintViLabel",
  hintEn: "hintEnLabel",
};

/** The question's detail page as its agents fill it: the same cards, each field filled where the agent works. */
export const LiveAssemblyForm = ({
  pieces,
  active,
  drops,
  taskType,
  section,
  stageLabel,
  laneLabels,
  text,
  checks,
  review,
  locale,
  saved,
  typed,
  thinking,
}: LiveAssemblyFormProps): ReactElement => (
  <div className="flex flex-col gap-5">
    <section className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{text.infoTitle}</h2>
        <div className="flex items-center gap-3">
          {saved && (
            <Link href={saved.href} className="text-sm font-medium text-[var(--action)] underline">
              {saved.label}
            </Link>
          )}
          <Chip tone="action" size="sm">
            {stageLabel}
          </Chip>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-[var(--divider)] pt-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            {text.taskType}
          </p>
          <Chip tone="brand">{taskType}</Chip>
        </div>
        {section && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
              {text.section}
            </p>
            <Chip tone="sky">{section}</Chip>
          </div>
        )}
      </div>
    </section>
    {GROUPS.map((group) => {
      const shown = pieces.filter((piece) => group.keys.includes(piece.key));
      if (shown.length === 0) return null;
      return (
        <section key={group.title} className={CARD}>
          <h3 className="text-sm font-semibold">{text[group.title]}</h3>
          {shown.map((piece) => (
            <LivePiece
              key={piece.key}
              piece={piece}
              label={text[LABEL_OF[piece.key]]}
              active={active}
              placed={drops.placed.has(piece.key)}
              flying={drops.flying === piece.key}
              waitingLabel={text.waitingFor.replace("{agent}", laneLabels[piece.lane])}
              text={text}
              checks={checks}
              review={review}
              locale={locale}
              typed={typed}
              thinking={thinking}
            />
          ))}
        </section>
      );
    })}
  </div>
);
