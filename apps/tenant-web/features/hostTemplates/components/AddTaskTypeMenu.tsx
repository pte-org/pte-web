"use client";

import { createPortal } from "react-dom";
import { useCallback, useRef, useState, type ReactElement } from "react";
import { Button, Chip, useAnchoredPanel, type ChipTone } from "@pte/ui";
import { taskTypeLabel } from "../utils/taskTypeLabel";

const BACKDROP_Z_INDEX = 55;
const PANEL_Z_INDEX = 60;

export interface AddableTaskType {
  taskTypeKey: string;
  section: string;
}

interface AddTaskTypeMenuProps {
  /** What can still be added back from the default template, in the order to show it. */
  entries: readonly AddableTaskType[];
  label: string;
  menuLabel: string;
  /** Why the button is off when there is nothing to add. */
  emptyHint: string;
  sectionLabel: (section: string) => string;
  sectionTone: (section: string) => ChipTone;
  onAdd: (taskTypeKey: string) => void;
}

/**
 * "+ Add task type": the task types of the default template that this one has dropped, to bring back one at a time.
 * Off, with the reason on hover, while every one of them is already in the table.
 */
export const AddTaskTypeMenu = ({
  entries,
  label,
  menuLabel,
  emptyHint,
  sectionLabel,
  sectionTone,
  onAdd,
}: AddTaskTypeMenuProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const close = useCallback((): void => setIsOpen(false), []);
  const position = useAnchoredPanel(isOpen, anchorRef, panelRef, close);

  if (entries.length === 0) {
    // The tooltip sits on a wrapper: a disabled button does not reliably show its own title.
    return (
      <span title={emptyHint}>
        <Button variant="secondary" disabled aria-label={`${label}. ${emptyHint}`}>
          + {label}
        </Button>
      </span>
    );
  }

  return (
    <div ref={anchorRef}>
      <Button
        variant="secondary"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        + {label}
      </Button>
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={close}
              className="fixed inset-0 cursor-default"
              style={{ zIndex: BACKDROP_Z_INDEX }}
            />
            <div
              ref={panelRef}
              role="menu"
              aria-label={menuLabel}
              className="fixed max-h-[min(24rem,calc(100vh-2rem))] w-72 overflow-y-auto rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] py-1 shadow-[var(--popover-shadow)] motion-safe:animate-pte-dropdown-in"
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                visibility: position ? "visible" : "hidden",
                zIndex: PANEL_Z_INDEX,
              }}
            >
              <p className="px-4 py-2 text-xs font-medium text-[var(--ink-muted)]">{menuLabel}</p>
              {entries.map((entry) => (
                <button
                  key={entry.taskTypeKey}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onAdd(entry.taskTypeKey);
                    close();
                  }}
                  className="flex min-h-10 w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-[var(--ink-primary)] outline-none transition-colors hover:bg-[var(--action-tint)] focus-visible:bg-[var(--action-tint)]"
                >
                  <span className="min-w-0 truncate">{taskTypeLabel(entry.taskTypeKey)}</span>
                  <Chip tone={sectionTone(entry.section)} size="sm">
                    {sectionLabel(entry.section)}
                  </Chip>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};
