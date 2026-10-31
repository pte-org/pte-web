"use client";

import { useId, type ReactElement, type ReactNode } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "../utils/cn";
import { GripVerticalIcon } from "./icons";
import { getReorderedIds, getRowDragStyle, useReorderSensors } from "./reorderDnd";

export interface SortableListProps<T> {
  items: readonly T[];
  /** Stable, unique id per item; it must not change when the item moves. */
  getId: (item: T) => string;
  /** The row's cells, as grid children laid out by `columnsClassName`. */
  renderCells: (item: T, index: number) => ReactNode;
  /**
   * Receives the full id order after a drop. Omit it for a read-only list: no drag
   * handles are rendered and the rows are plain cards.
   */
  onReorder?: (orderedIds: string[]) => void;
  /** Accessible name of every drag handle (e.g. "Drag to reorder"). */
  dragHandleLabel: string;
  /** Tailwind grid columns for the row card from `sm` up, e.g. `sm:grid-cols-[1fr_120px_40px]`. */
  columnsClassName: string;
  ariaLabel?: string;
  emptyContent?: ReactNode;
  className?: string;
}

const ROW_CLASS = "flex items-center gap-2.5";
const CARD_CLASS =
  "grid min-w-0 flex-1 grid-cols-1 gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] px-4 py-4 shadow-xs transition-shadow duration-200 hover:shadow-sm sm:items-center sm:gap-5";
const HANDLE_CLASS =
  "flex h-8 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 active:cursor-grabbing";

interface SortableRowProps {
  id: string;
  handleLabel: string;
  columnsClassName: string;
  children: ReactNode;
}

const SortableRow = ({
  id,
  handleLabel,
  columnsClassName,
  children,
}: SortableRowProps): ReactElement => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={getRowDragStyle(transform, transition)}
      className={cn(ROW_CLASS, isDragging && "relative z-10 opacity-70")}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={handleLabel}
        className={HANDLE_CLASS}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="h-5 w-5" />
      </button>
      <div className={cn(CARD_CLASS, columnsClassName)}>{children}</div>
    </li>
  );
};

export const SortableList = <T,>({
  items,
  getId,
  renderCells,
  onReorder,
  dragHandleLabel,
  columnsClassName,
  ariaLabel,
  emptyContent,
  className,
}: SortableListProps<T>): ReactElement => {
  // A stable DndContext id keeps the generated aria ids identical on server and client.
  const dndContextId = useId();
  const sensors = useReorderSensors();
  const ids = items.map(getId);
  const isReorderable = onReorder !== undefined;

  const handleDragEnd = (event: DragEndEvent): void => {
    const orderedIds = getReorderedIds(ids, event);
    if (orderedIds) onReorder?.(orderedIds);
  };

  if (items.length === 0) return <>{emptyContent}</>;

  const rows = items.map((item, index) =>
    isReorderable ? (
      <SortableRow
        key={ids[index]}
        id={ids[index]}
        handleLabel={dragHandleLabel}
        columnsClassName={columnsClassName}
      >
        {renderCells(item, index)}
      </SortableRow>
    ) : (
      <li key={ids[index]} className={ROW_CLASS}>
        <div className={cn(CARD_CLASS, columnsClassName)}>{renderCells(item, index)}</div>
      </li>
    ),
  );
  const list = (
    <ul aria-label={ariaLabel} className="flex flex-col gap-3">
      {rows}
    </ul>
  );

  return (
    <div className={className}>
      {isReorderable ? (
        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {list}
          </SortableContext>
        </DndContext>
      ) : (
        list
      )}
    </div>
  );
};
