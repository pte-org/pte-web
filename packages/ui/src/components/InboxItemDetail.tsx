"use client";

import type { InboxItemResponse } from "@pte/api-client";
import type { ReactElement } from "react";
import { Badge } from "./Badge";
import { useInboxItemText } from "./useInboxItemText";

/** One notification in full, in the language of the screen: category and time on top, then its title and text. */
export const InboxItemDetail = ({ item }: { item: InboxItemResponse }): ReactElement => {
  const text = useInboxItemText(item);

  return (
    <article className="rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] p-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={item.importance === "IMPORTANT" ? "warning" : "info"}>{text.categoryLabel}</Badge>
        <time dateTime={item.deliveredAt} className="text-xs text-[var(--ink-muted)]">
          {text.time}
        </time>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-[var(--ink-primary)]">{text.title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--ink-secondary)]">{text.body}</p>
    </article>
  );
};
