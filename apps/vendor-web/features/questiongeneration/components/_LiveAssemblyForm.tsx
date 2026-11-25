import type { ReactElement } from "react";
import { Chip } from "@pte/ui";
import type { AssemblyText } from "../assemblyConstants";
import type { LiveLane } from "../liveConstants";
import type { DropQueue } from "../hooks/useDropQueue";
import type { ActivePiece, LivePiece as Piece, PieceKey } from "../utils/livePieces";
import { LivePiece } from "./_LivePiece";

interface LiveAssemblyFormProps {
  pieces: Piece[];
  active: ActivePiece | null;
  drops: DropQueue;
  taskType: string;
  section: string;
  stageLabel: string;
  laneLabels: Record<LiveLane, string>;
  text: AssemblyText;
}

const CARD =
  "flex flex-col gap-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-card";
const GROUPS: { title: keyof AssemblyText; keys: PieceKey[] }[] = [
  { title: "contentTitle", keys: ["prompt", "audio", "image"] },
  { title: "optionsTitle", keys: ["options"] },
  { title: "answerTitle", keys: ["reference", "transcript"] },
];
const LABEL_OF: Record<PieceKey, keyof AssemblyText> = {
  prompt: "promptLabel",
  audio: "audioLabel",
  image: "imageLabel",
  options: "optionsTitle",
  reference: "referenceLabel",
  transcript: "transcriptLabel",
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
}: LiveAssemblyFormProps): ReactElement => (
  <div className="flex flex-col gap-5">
    <section className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{text.infoTitle}</h2>
        <Chip tone="action" size="sm">
          {stageLabel}
        </Chip>
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
            />
          ))}
        </section>
      );
    })}
  </div>
);
