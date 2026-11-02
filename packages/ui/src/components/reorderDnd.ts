import type { CSSProperties } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS, type Transform } from "@dnd-kit/utilities";

const DRAG_ACTIVATION_DISTANCE_PX = 6;

/** Pointer (after a short drag distance, so clicks still work) and keyboard sensors. */
export const useReorderSensors = (): SensorDescriptor<SensorOptions>[] =>
  useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE_PX } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

/** The id order after a drop, or `null` when nothing moved or an id is unknown. */
export const getReorderedIds = (ids: readonly string[], event: DragEndEvent): string[] | null => {
  const { active, over } = event;
  if (!over || active.id === over.id) return null;
  const from = ids.indexOf(String(active.id));
  const to = ids.indexOf(String(over.id));
  if (from < 0 || to < 0) return null;
  return arrayMove([...ids], from, to);
};

/** Where the dragged row's pointer is now: the point the drag began at plus how far it has travelled. */
export const getDragPoint = (
  event: Pick<DragEndEvent, "activatorEvent" | "delta">,
): { x: number; y: number } | null => {
  const origin = event.activatorEvent as Partial<MouseEvent>;
  if (typeof origin.clientX !== "number" || typeof origin.clientY !== "number") return null;
  return { x: origin.clientX + event.delta.x, y: origin.clientY + event.delta.y };
};

/** The element matching `selector` under the dragged row's pointer, if any. */
export const findDropOutTarget = (
  point: { x: number; y: number } | null,
  selector: string,
): Element | null =>
  point
    ? (document
        .elementsFromPoint(point.x, point.y)
        .map((element) => element.closest(selector))
        .find((match) => match !== null) ?? null)
    : null;

/**
 * dnd-kit moves the dragged row with a per-frame transform, which cannot be a Tailwind
 * class. x is pinned to 0 so the row only travels along the list.
 */
export const getRowDragStyle = (
  transform: Transform | null,
  transition: string | undefined,
): CSSProperties => ({
  transform: CSS.Transform.toString(transform ? { ...transform, x: 0 } : null),
  transition,
});
