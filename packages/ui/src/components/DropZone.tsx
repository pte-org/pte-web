"use client";

import { useRef, useState, type DragEvent, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";

interface DropZoneProps {
  /** The data type a dragged item must carry (set with `dataTransfer.setData(accept, payload)`). */
  accept: string;
  /** Receives what the dropped item carried. */
  onDropPayload: (payload: string) => void;
  /** Ignores drags altogether, e.g. while the target is read-only. */
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Wraps a region that takes items dragged in from elsewhere on the page. While a matching item is
 * over it, the region is outlined; other drags (a table row being reordered, a file) pass through.
 */
export const DropZone = ({
  accept,
  onDropPayload,
  disabled = false,
  className,
  children,
}: DropZoneProps): ReactElement => {
  const [isOver, setIsOver] = useState(false);
  // dragenter and dragleave fire for every child the pointer crosses; count them so the outline
  // does not flicker while moving over the table's cells.
  const depth = useRef(0);
  const accepts = (event: DragEvent<HTMLElement>): boolean =>
    !disabled && Array.from(event.dataTransfer.types).includes(accept);

  return (
    <div
      className={cn(
        "rounded-xl outline-2 outline-dashed outline-transparent transition-[outline-color,background-color]",
        isOver && "bg-[var(--action-tint)] outline-[var(--brand)]",
        className,
      )}
      onDragEnter={(event) => {
        if (!accepts(event)) return;
        depth.current += 1;
        setIsOver(true);
      }}
      onDragOver={(event) => {
        if (!accepts(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        if (!accepts(event)) return;
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setIsOver(false);
      }}
      onDrop={(event) => {
        if (!accepts(event)) return;
        event.preventDefault();
        depth.current = 0;
        setIsOver(false);
        onDropPayload(event.dataTransfer.getData(accept));
      }}
    >
      {children}
    </div>
  );
};
