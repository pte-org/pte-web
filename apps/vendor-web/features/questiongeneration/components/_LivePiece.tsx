"use client";

import type { ReactElement } from "react";
import { Chip, cn } from "@pte/ui";
import { usePromptMedia } from "@/features/questionbank/hooks/usePromptMediaUrl";
import type { AssemblyText } from "../assemblyConstants";
import { LANE_TONES } from "../liveTones";
import type { ActivePiece, LivePiece as Piece } from "../utils/livePieces";
import { optionLetter } from "../utils/draftFields";

interface LivePieceProps {
  piece: Piece;
  label: string;
  active: ActivePiece | null;
  placed: boolean;
  flying: boolean;
  waitingLabel: string;
  text: AssemblyText;
}

const MediaValue = ({ piece }: { piece: Piece }): ReactElement | null => {
  const { url } = usePromptMedia(piece.mediaRef);
  if (!url) return null;
  if (piece.key === "audio") return <audio controls src={url} className="w-full max-w-md" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- a signed preview address, not a static asset
    <img src={url} alt="" className="max-h-40 rounded-md border border-[var(--border-subtle)]" />
  );
};

const Value = ({ piece, writing }: { piece: Piece; writing: boolean }): ReactElement => {
  const caret = writing ? (
    <span
      data-caret
      className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-indigo-500 align-middle"
    />
  ) : null;
  if (piece.key === "audio" || piece.key === "image") return <MediaValue piece={piece} />;
  if (piece.key === "options") {
    return (
      <ol className="space-y-2">
        {piece.items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 rounded-md border border-[var(--border-subtle)] px-3 py-2 text-sm"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-subtle)] text-xs font-semibold text-[var(--ink-muted)]">
              {optionLetter(index)}
            </span>
            <span className="flex-1">
              {item}
              {index === piece.items.length - 1 && caret}
            </span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed">
      {piece.text}
      {caret}
    </p>
  );
};

/** One field of the form an agent fills: tinted while it works on it, then marked once it is on the exam screen. */
export const LivePiece = ({
  piece,
  label,
  active,
  placed,
  flying,
  waitingLabel,
  text,
}: LivePieceProps): ReactElement => {
  const working = active?.key === piece.key ? active : null;
  const status = placed
    ? text.placed
    : flying
      ? text.placing
      : piece.ready && !piece.studentFacing
        ? text.checked
        : null;
  return (
    <div
      data-piece={piece.key}
      className={cn(
        "-m-1 rounded-md p-1 transition-all duration-300",
        working && LANE_TONES[working.lane].mark,
        flying && "opacity-60",
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
          {label}
        </span>
        {status && (
          <Chip tone={placed || !piece.studentFacing ? "mint" : "action"} size="sm">
            {status}
          </Chip>
        )}
      </div>
      {piece.filled ? (
        <Value piece={piece} writing={working?.lane === "GENERATOR"} />
      ) : (
        <p className="text-sm italic text-[var(--ink-muted)]">{waitingLabel}</p>
      )}
    </div>
  );
};
