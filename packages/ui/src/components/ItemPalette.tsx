"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { DisclosureChevron } from "./DisclosureChevron";
import { Button } from "./Button";
import { Chip, type ChipTone } from "./Chip";
import { DashboardCard } from "./DashboardCard";
import { GripVerticalIcon } from "./icons";

export interface PaletteEntry {
  id: string;
  label: string;
  /** What the entries are grouped by when the palette mixes several groups. */
  section: string;
}

interface ItemPaletteProps {
  title: string;
  hint: string;
  /** What to say when there is nothing left to add. */
  emptyText: string;
  /** Names the + button of an entry for assistive technology: "Add task type: READ_ALOUD". */
  addLabel: string;
  entries: readonly PaletteEntry[];
  /** Groups the list by section, for a view that mixes sections. */
  grouped: boolean;
  sectionLabel: (section: string) => string;
  sectionTone: (section: string) => ChipTone;
  /** What an entry carries when it is dragged out: its id, under this type. */
  dragType: string;
  /** Marks the palette as the place a table row can be dragged back to, to take it out. */
  dropAttribute?: string;
  onAdd: (id: string) => void;
}

const groupBySection = (entries: readonly PaletteEntry[]): [string, PaletteEntry[]][] => {
  const groups = new Map<string, PaletteEntry[]>();
  for (const entry of entries)
    groups.set(entry.section, [...(groups.get(entry.section) ?? []), entry]);
  return [...groups.entries()];
};

interface PaletteGroupProps {
  title: string;
  tone: ChipTone;
  count: number;
  children: ReactNode;
}

/** One section's entries under a header that folds them away; open by default. */
const PaletteGroup = ({ title, tone, count, children }: PaletteGroupProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="space-y-1">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left hover:bg-[var(--surface-subtle)]"
      >
        <Chip tone={tone} size="sm">
          {title}
        </Chip>
        <span className="ml-auto text-xs text-[var(--ink-muted)]">{count}</span>
        <DisclosureChevron expanded={isOpen} />
      </button>
      {isOpen && children}
    </section>
  );
};

/**
 * What can still be added to the table beside it. Each entry is dragged into the table, or added with its +
 * button, which is also the way to do it from the keyboard. Used wherever a table is filled from a fixed set.
 */
export const ItemPalette = ({
  title,
  hint,
  emptyText,
  addLabel,
  entries,
  grouped,
  sectionLabel,
  sectionTone,
  dragType,
  dropAttribute,
  onAdd,
}: ItemPaletteProps): ReactElement => {
  const renderRows = (rows: readonly PaletteEntry[]): ReactElement => (
    <ul className="space-y-1">
      {rows.map((entry) => (
        <li
          key={entry.id}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(dragType, entry.id);
            event.dataTransfer.effectAllowed = "copy";
          }}
          className="flex cursor-grab items-center gap-1.5 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] py-1.5 pl-1 pr-1.5 active:cursor-grabbing"
        >
          <GripVerticalIcon className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" />
          <span className="min-w-0 flex-1 text-sm text-[var(--ink-primary)]">{entry.label}</span>
          <Button
            size="sm"
            variant="secondary"
            appearance="ghost"
            iconOnly
            aria-label={`${addLabel}: ${entry.label}`}
            onClick={() => onAdd(entry.id)}
          >
            +
          </Button>
        </li>
      ))}
    </ul>
  );

  return (
    <DashboardCard
      className="border p-3 transition-colors data-[drag-over=true]:border-[var(--brand)] data-[drag-over=true]:bg-[var(--action-tint)]"
      {...(dropAttribute ? { [dropAttribute]: "" } : {})}
    >
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
        {entries.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--shell-border)] px-3 py-4 text-center text-xs text-[var(--ink-muted)]">
            {emptyText}
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--ink-muted)]">{hint}</p>
            <div className="space-y-2">
              {grouped
                ? groupBySection(entries).map(([section, rows]) => (
                    <PaletteGroup
                      key={section}
                      title={sectionLabel(section)}
                      tone={sectionTone(section)}
                      count={rows.length}
                    >
                      {renderRows(rows)}
                    </PaletteGroup>
                  ))
                : renderRows(entries)}
            </div>
          </>
        )}
      </section>
    </DashboardCard>
  );
};
