"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "../utils/cn";
import { GripVerticalIcon } from "./icons";
import {
  findDropOutTarget,
  getDragPoint,
  getReorderedIds,
  getRowDragStyle,
  useReorderSensors,
} from "./reorderDnd";

const HANDLE_CLASS =
  "flex h-8 w-6 cursor-grab touch-none items-center justify-center rounded-md text-[var(--ink-muted)] transition-colors hover:text-[var(--ink-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35 active:cursor-grabbing";

/** A region outside the table that a row can be dragged onto to be taken out of the list. */
export interface RowDropOut {
  /** CSS selector of the region; it gets `data-drag-over="true"` while a row is over it. */
  targetSelector: string;
  /** Receives the key of the row that was dropped there. */
  onDrop: (key: string) => void;
  /**
   * What floats under the pointer while the row is dragged. It is drawn outside the table, so it is not
   * clipped by the table's scroll area and can travel to the region.
   */
  renderPreview: (key: string) => ReactNode;
}

/** True while a floating preview stands in for the dragged row, so the row itself stays put. */
const PreviewContext = createContext(false);

const DRAG_OVER_ATTRIBUTE = "data-drag-over";

interface RowReorderProviderProps {
  /** Keys of the rows shown, in display order. */
  keys: readonly string[];
  /** Receives the new key order after a drop. Without it the rows are not draggable. */
  onReorder?: (orderedKeys: string[]) => void;
  dropOut?: RowDropOut;
  children: ReactNode;
}

/** Drag-and-drop context for a table's rows; a pass-through when `onReorder` is absent. */
export const RowReorderProvider = ({
  keys,
  onReorder,
  dropOut,
  children,
}: RowReorderProviderProps): ReactElement => {
  // A stable DndContext id keeps the generated aria ids identical on server and client.
  const dndContextId = useId();
  const sensors = useReorderSensors();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  // The drag's own delta drifts when a scroll area scrolls under it, so follow the pointer itself.
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const trackPointer = (event: PointerEvent): void => {
    pointer.current = { x: event.clientX, y: event.clientY };
  };

  if (!onReorder) return <>{children}</>;

  const clearHighlight = (): void => {
    if (!dropOut) return;
    document
      .querySelectorAll(`[${DRAG_OVER_ATTRIBUTE}]`)
      .forEach((element) => element.removeAttribute(DRAG_OVER_ATTRIBUTE));
  };

  const pointerNow = (event: DragMoveEvent | DragEndEvent): { x: number; y: number } | null =>
    pointer.current ?? getDragPoint(event);

  const stopTracking = (): void => {
    window.removeEventListener("pointermove", trackPointer);
    pointer.current = null;
    setActiveKey(null);
  };

  const handleDragStart = (event: DragStartEvent): void => {
    if (!dropOut) return;
    setActiveKey(String(event.active.id));
    window.addEventListener("pointermove", trackPointer);
  };

  const handleDragMove = (event: DragMoveEvent): void => {
    if (!dropOut) return;
    clearHighlight();
    findDropOutTarget(pointerNow(event), dropOut.targetSelector)?.setAttribute(
      DRAG_OVER_ATTRIBUTE,
      "true",
    );
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    clearHighlight();
    const droppedOut = dropOut && findDropOutTarget(pointerNow(event), dropOut.targetSelector);
    stopTracking();
    if (dropOut && droppedOut) {
      dropOut.onDrop(String(event.active.id));
      return;
    }
    const orderedKeys = getReorderedIds(keys, event);
    if (orderedKeys) onReorder(orderedKeys);
  };

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        clearHighlight();
        stopTracking();
      }}
    >
      <PreviewContext.Provider value={dropOut !== undefined}>
        <SortableContext items={[...keys]} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </PreviewContext.Provider>
      {dropOut && (
        // The preview must not catch the pointer, or the region under it can never be found; it is also
        // only as wide as its content, not as wide as the row it stands in for.
        <DragOverlay dropAnimation={null} className="pointer-events-none !w-auto !h-auto">
          {activeKey ? dropOut.renderPreview(activeKey) : null}
        </DragOverlay>
      )}
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
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const hasPreview = useContext(PreviewContext);

  return (
    <tr
      ref={setNodeRef}
      // With a floating preview the row stays where it was and dims; without one it follows the pointer.
      style={hasPreview ? undefined : getRowDragStyle(transform, transition)}
      className={cn(
        className,
        isDragging &&
          (hasPreview ? "opacity-40" : "relative z-10 bg-[var(--table-row-hover)] opacity-80"),
      )}
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
