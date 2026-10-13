import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Badge, type BadgeVariant } from "./Badge";
import { ChevronRightIcon } from "./icons";

export type ActivityListVariant = "timeline" | "actions";

export interface ActivityListItem {
  id: string;
  title: string;
  description?: string;
  /** Timeline: already formatted time or date, e.g. "10:30". */
  timeLabel?: string;
  /** Timeline: small secondary line such as the actor. */
  meta?: string;
  /** Actions: already formatted count shown as a badge. */
  count?: number | string;
  /**
   * Marker colour (timeline) or badge variant (actions). Colour only: state any evaluative
   * meaning in `title`/`description` as well, since assistive technology does not get the colour.
   */
  tone?: BadgeVariant;
  /** Optional leading icon (timeline marker or action glyph). */
  icon?: ReactNode;
  /** Actions: makes the row a link. */
  href?: string;
  /** Actions: makes the row a button when there is no `href`. */
  onClick?: () => void;
}

export interface ActivityListLinkProps {
  href: string;
  className: string;
  children: ReactNode;
}

export interface ActivityListProps {
  items: readonly ActivityListItem[];
  variant?: ActivityListVariant;
  ariaLabel: string;
  emptyLabel: string;
  /** Adapter for framework client navigation (for example Next Link); defaults to a native anchor. */
  renderLink?: (props: ActivityListLinkProps) => ReactElement;
  className?: string;
}

const TIMELINE_MARKER_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-[var(--mint-action)]",
  warning: "bg-[var(--cream-action)]",
  danger: "bg-[var(--blush-action)]",
  info: "bg-[var(--sky-action)]",
  neutral: "bg-[var(--ink-muted)]",
};

const ROW_CLASSES =
  "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left";
const INTERACTIVE_ROW_CLASSES =
  "transition-colors hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)]";

const TimelineItem = ({ item }: { item: ActivityListItem }): ReactElement => (
  <li className="relative pb-5 pl-6 last:pb-0">
    <span
      aria-hidden="true"
      className={cn(
        "absolute -left-1.25 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--surface-card)]",
        TIMELINE_MARKER_CLASSES[item.tone ?? "neutral"],
      )}
    />
    <div className="flex items-start gap-2">
      {item.icon && <span className="mt-0.5 shrink-0 text-[var(--ink-muted)] [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
      <div className="min-w-0">
        {item.timeLabel && <p className="text-xs text-[var(--ink-muted)]">{item.timeLabel}</p>}
        <p className="text-sm font-medium text-[var(--ink-primary)]">{item.title}</p>
        {item.description && <p className="mt-0.5 text-sm text-[var(--ink-secondary)]">{item.description}</p>}
        {item.meta && <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{item.meta}</p>}
      </div>
    </div>
  </li>
);

const ActionContent = ({ item, interactive }: { item: ActivityListItem; interactive: boolean }): ReactElement => (
  <>
    <span className="flex min-w-0 items-center gap-2">
      {item.icon && <span className="shrink-0 text-[var(--ink-muted)] [&>svg]:h-4 [&>svg]:w-4">{item.icon}</span>}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[var(--ink-primary)]">{item.title}</span>
        {item.description && (
          <span className="block truncate text-xs text-[var(--ink-secondary)]">{item.description}</span>
        )}
      </span>
    </span>
    <span className="flex shrink-0 items-center gap-2">
      {item.count !== undefined && <Badge variant={item.tone ?? "neutral"}>{item.count}</Badge>}
      {interactive && <ChevronRightIcon className="h-4 w-4 text-[var(--ink-muted)]" />}
    </span>
  </>
);

const ActionItem = ({
  item,
  renderLink,
}: {
  item: ActivityListItem;
  renderLink?: ActivityListProps["renderLink"];
}): ReactElement => {
  if (item.href) {
    const linkProps: ActivityListLinkProps = {
      href: item.href,
      className: cn(ROW_CLASSES, INTERACTIVE_ROW_CLASSES),
      children: <ActionContent item={item} interactive />,
    };
    return <li>{renderLink ? renderLink(linkProps) : <a {...linkProps} />}</li>;
  }
  if (item.onClick) {
    return (
      <li>
        <button type="button" onClick={item.onClick} className={cn(ROW_CLASSES, INTERACTIVE_ROW_CLASSES)}>
          <ActionContent item={item} interactive />
        </button>
      </li>
    );
  }
  return (
    <li className={ROW_CLASSES}>
      <ActionContent item={item} interactive={false} />
    </li>
  );
};

/**
 * Domain-neutral list for "recent activity" (`timeline`) and "needs attention" (`actions`).
 * All text, counts and links come from the caller; the list only lays them out.
 */
export const ActivityList = ({
  items,
  variant = "timeline",
  ariaLabel,
  emptyLabel,
  renderLink,
  className,
}: ActivityListProps): ReactElement => {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-24 items-center justify-center rounded-lg bg-[var(--surface-subtle)] px-5 text-center text-sm text-[var(--ink-muted)]",
          className,
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  if (variant === "timeline") {
    return (
      <ol aria-label={ariaLabel} className={cn("ml-1 border-l border-[var(--shell-border)]", className)}>
        {items.map((item) => (
          <TimelineItem key={item.id} item={item} />
        ))}
      </ol>
    );
  }

  return (
    <ul aria-label={ariaLabel} className={cn("grid gap-1", className)}>
      {items.map((item) => (
        <ActionItem key={item.id} item={item} renderLink={renderLink} />
      ))}
    </ul>
  );
};
