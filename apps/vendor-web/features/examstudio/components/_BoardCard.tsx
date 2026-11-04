"use client";

import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { ActionMenu, cn, type ActionMenuItem } from "@pte/ui";

interface BoardCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Chips across the top: what the card is. */
  tags: ReactNode;
  title: string;
  /** A muted line under the title. */
  note?: ReactNode;
  /** Who wrote it; the footer shows nothing about a person when it is empty. */
  authorName?: string | null;
  /** The left end of the footer, such as when the card last changed. */
  meta?: ReactNode;
  /** Buttons under the footer. */
  actions?: ReactNode;
  /** The menu behind the dots at the top right; none is drawn when it is empty. */
  menu?: ActionMenuItem[];
  menuLabel?: string;
  draggable?: boolean;
  /** Shows the six-dot grip that tells the card can be dragged; only for a card that can be. */
  grip?: boolean;
  /** The hint shown on the grip. */
  gripLabel?: string;
}

const GripIcon = (): ReactElement => (
  <svg viewBox="0 0 8 14" fill="currentColor" className="h-3.5 w-2" aria-hidden="true">
    <circle cx="1.5" cy="2" r="1.1" />
    <circle cx="6.5" cy="2" r="1.1" />
    <circle cx="1.5" cy="7" r="1.1" />
    <circle cx="6.5" cy="7" r="1.1" />
    <circle cx="1.5" cy="12" r="1.1" />
    <circle cx="6.5" cy="12" r="1.1" />
  </svg>
);

const ClockIcon = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="h-3 w-3"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * The card of every board: tags with a menu at the top, a bold title, then a footer with when it changed on
 * the left and who wrote it on the right.
 */
export const BoardCard = ({
  tags,
  title,
  note,
  authorName,
  meta,
  actions,
  menu,
  menuLabel,
  grip,
  gripLabel,
  className,
  ...rest
}: BoardCardProps): ReactElement => (
  <article
    className={cn(
      "space-y-3 rounded-xl border border-[var(--shell-border)]/70 bg-[var(--surface-card)] p-3.5 shadow-sm transition hover:shadow-md",
      className,
    )}
    {...rest}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        {grip && (
          <span className="-ml-1 mr-0.5 text-[var(--ink-muted)]" title={gripLabel}>
            <GripIcon />
          </span>
        )}
        {tags}
      </div>
      {menu && menu.length > 0 && (
        // The card itself opens on a click, so a click on the menu must not reach it.
        <div onClick={(event) => event.stopPropagation()} className="-mr-1.5 -mt-1 shrink-0">
          <ActionMenu items={menu} label={menuLabel} triggerClassName="h-7 w-7" />
        </div>
      )}
    </div>
    <p className="line-clamp-3 text-[15px] font-semibold leading-snug text-[var(--ink-primary)]">
      {title}
    </p>
    {note && <div className="text-xs text-[var(--ink-muted)]">{note}</div>}
    {(authorName || meta) && (
      <div className="flex items-center justify-between gap-2">
        {meta ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--surface-subtle)] px-2 py-1 text-[11px] text-[var(--ink-secondary)]">
            <ClockIcon />
            {meta}
          </span>
        ) : (
          <span />
        )}
        {authorName && (
          <span className="flex min-w-0 items-center gap-1.5" title={authorName}>
            <span
              aria-hidden="true"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--brand-tint)] text-[10px] font-semibold text-[var(--brand-ink)]"
            >
              {authorName.trim().charAt(0).toUpperCase()}
            </span>
            <span className="max-w-[96px] truncate text-xs font-medium text-[var(--ink-secondary)]">
              {authorName}
            </span>
          </span>
        )}
      </div>
    )}
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </article>
);
