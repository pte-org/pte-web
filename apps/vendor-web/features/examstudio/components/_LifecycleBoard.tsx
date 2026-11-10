"use client";

import { useState, type DragEvent, type ReactElement, type ReactNode } from "react";
import { LockIcon, cn } from "@pte/ui";
import type { MoveVerdict } from "../kanbanTransitions";
import {
  BOARD_COLUMN_FRAME,
  BOARD_COUNT_CLASS,
  BOARD_HEADER_CLASS,
  BOARD_TONE,
  type BoardTone,
} from "./boardTone";

export type LifecycleTone = BoardTone;

export interface LifecycleColumn {
  id: string;
  title: string;
  tone: LifecycleTone;
}

/** What a card needs to be dragged: the attributes for its element and whether to show the grip. */
export interface LifecycleDragProps {
  draggable: boolean;
  grip: boolean;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
}

interface LifecycleBoardProps<TItem> {
  columns: readonly LifecycleColumn[];
  items: readonly TItem[];
  /** The id of the column an item sits in. */
  columnOf: (item: TItem) => string;
  keyOf: (item: TItem) => string;
  renderCard: (item: TItem, drag: LifecycleDragProps) => ReactNode;
  emptyLabel: string;
  /** What dropping an item on a column would do; leave out for a board whose cards cannot be dragged. */
  verdictOf?: (item: TItem, columnId: string) => MoveVerdict;
  /** Called when an item is dropped on a column that accepts it. */
  onMove?: (item: TItem, columnId: string) => void;
  /** Shown on a column that cannot take the dragged card because of the user's role. */
  lockedLabel?: string;
}

/**
 * Items laid out by where they stand in a lifecycle. For a set small enough to hold whole, such as task
 * types or templates; the question board loads its columns from the server instead. A column that has no
 * step for the card being dragged does not accept it, so the browser shows "not allowed" at once.
 */
export const LifecycleBoard = <TItem,>({
  columns,
  items,
  columnOf,
  keyOf,
  renderCard,
  emptyLabel,
  verdictOf,
  onMove,
  lockedLabel,
}: LifecycleBoardProps<TItem>): ReactElement => {
  const [dragged, setDragged] = useState<TItem | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const canDrag = verdictOf !== undefined && onMove !== undefined;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((column) => {
        const inColumn = items.filter((item) => columnOf(item) === column.id);
        const verdict: MoveVerdict | null =
          dragged !== null && verdictOf && columnOf(dragged) !== column.id
            ? verdictOf(dragged, column.id)
            : null;
        const accepts = verdict === null || verdict === "allowed";

        return (
          <section
            key={column.id}
            aria-label={column.title}
            onDragOver={(event) => {
              if (!accepts) return;
              event.preventDefault();
              setOverColumn(column.id);
            }}
            onDragLeave={() => setOverColumn(null)}
            onDrop={(event) => {
              event.preventDefault();
              setOverColumn(null);
              const card = dragged;
              setDragged(null);
              if (card && verdict === "allowed") onMove?.(card, column.id);
            }}
            className={cn(
              "flex min-h-48 flex-col gap-3 outline-2 outline-dashed outline-transparent transition",
              BOARD_COLUMN_FRAME,
              BOARD_TONE[column.tone].column,
              verdict === "allowed" && "outline-[var(--brand)]/40",
              overColumn === column.id && accepts && dragged !== null && "outline-[var(--brand)]",
              (verdict === "needs-reviewer" || verdict === "not-a-step") && "opacity-60",
            )}
          >
            <h3 className={BOARD_HEADER_CLASS}>
              <span
                className={cn("h-2 w-2 rounded-full", BOARD_TONE[column.tone].dot)}
                aria-hidden="true"
              />
              {column.title}
              <span className={BOARD_COUNT_CLASS}>({inColumn.length})</span>
            </h3>
            {verdict === "needs-reviewer" && lockedLabel && (
              <p className="flex items-center gap-1.5 text-xs text-[var(--ink-secondary)]">
                <LockIcon className="h-3.5 w-3.5 shrink-0" />
                {lockedLabel}
              </p>
            )}
            {inColumn.length === 0 && (
              <p className="text-xs text-[var(--ink-muted)]">{emptyLabel}</p>
            )}
            <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto pr-0.5">
              {inColumn.map((item) => {
                // A card is draggable only when at least one other column has a step for it.
                const movable =
                  canDrag &&
                  columns.some(
                    (other) => other.id !== column.id && verdictOf(item, other.id) !== "not-a-step",
                  );
                return (
                  <div key={keyOf(item)} className={cn(dragged === item && "opacity-40")}>
                    {renderCard(item, {
                      draggable: movable,
                      grip: movable,
                      onDragStart: (event) => {
                        event.dataTransfer.setData("text/plain", keyOf(item));
                        setDragged(item);
                      },
                      onDragEnd: () => {
                        setDragged(null);
                        setOverColumn(null);
                      },
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
};
