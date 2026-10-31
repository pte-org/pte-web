"use client";

import { useId, type ReactElement, type ReactNode } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "../utils/cn";
import { GripVerticalIcon } from "./icons";
import { getReorderedIds, getRowDragStyle, useReorderSensors } from "./reorderDnd";

const HANDLE_CLASS =
  "flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 active:cursor-grabbing";

interface RowReorderProviderProps {
  /** Keys of the rows shown, in display order. */
  keys: readonly string[];
  /** Receives the new key order after a drop. Without it the rows are not draggable. */
  onReorder?: (orderedKeys: string[]) => void;
  children: ReactNode;
}

/** Drag-and-drop context for a table's rows; a pass-through when `onReorder` is absent. */
export const RowReorderProvider = ({
  keys,
  onReorder,
  children,
}: RowReorderProviderProps): ReactElement => {
  // A stable DndContext id keeps the generated aria ids identical on server and client.
  const dndContextId = useId();
  const sensors = useReorderSensors();

  if (!onReorder) return <>{children}</>;

  const handleDragEnd = (event: DragEndEvent): void => {
    const orderedKeys = getReorderedIds(keys, event);
    if (orderedKeys) onReorder(orderedKeys);
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={[...keys]} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};

interface SortableTableRowProps {
  id: string;
  className?: string;
  handleLabel: string;
  cellClassName: string;
  children: ReactNode;
}

/** A body row with a leading drag-handle cell; the caller's cells follow it. */
export const SortableTableRow = ({
  id,
  className,
  handleLabel,
  cellClassName,
  children,
}: SortableTableRowProps): ReactElement => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      style={getRowDragStyle(transform, transition)}
      className={cn(className, isDragging && "relative z-10 bg-[var(--table-row-hover)] opacity-80")}
    >
      <td className={cn("w-10", cellClassName)}>
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
      </td>
      {children}
    </tr>
  );
};
