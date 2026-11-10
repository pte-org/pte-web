import type { ReactElement } from "react";
import { GripVerticalIcon } from "./icons";

interface RowDragPreviewProps {
  /** What the row is called while it is carried: its key. */
  label: string;
}

/** What floats under the pointer while a table row is dragged out of the table, to the palette beside it. */
export const RowDragPreview = ({ label }: RowDragPreviewProps): ReactElement => (
  <div className="flex cursor-grabbing items-center gap-2 rounded-lg border border-[var(--brand)] bg-[var(--surface-card)] px-3 py-2 font-mono text-xs shadow-lg">
    <GripVerticalIcon className="h-4 w-4 text-[var(--ink-muted)]" />
    {label}
  </div>
);
