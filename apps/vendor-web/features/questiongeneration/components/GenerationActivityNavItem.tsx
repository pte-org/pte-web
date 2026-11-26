"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { cn, useLocale } from "@pte/ui";
import { useGenerationActivity } from "../hooks/useGenerationActivity";
import { LIVE_TEXT } from "../liveConstants";
import { taskTypeLabel } from "../utils/taskTypeLabel";

interface GenerationActivityNavItemProps {
  /** Only authors of academic content may see generation jobs. */
  enabled: boolean;
  /** The sidebar is collapsed to icons: only the pulsing dot is shown. */
  collapsed: boolean;
  onNavigate?: () => void;
}

/**
 * A sub-item under the question bank while the AI writes questions: a pulsing dot, what runs and how far it got. It
 * opens the batch or run full screen, from any page.
 */
export const GenerationActivityNavItem = ({
  enabled,
  collapsed,
  onNavigate,
}: GenerationActivityNavItemProps): ReactElement | null => {
  const { locale } = useLocale();
  const text = LIVE_TEXT[locale === "vi" ? "vi" : "en"];
  const activity = useGenerationActivity(enabled);
  if (!activity) return null;
  const title =
    activity.kind === "batch" ? text.activityBatch : taskTypeLabel(activity.taskType ?? "");
  const progress = text.activityProgress
    .replace("{done}", String(activity.done))
    .replace("{total}", String(activity.total));
  const dot = (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--action)] opacity-60" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--action)]" />
    </span>
  );
  return (
    <div
      className={cn(
        "mt-1",
        collapsed ? "flex justify-center" : "ml-5 border-l border-[var(--border-subtle)] pl-3",
      )}
    >
      <Link
        href={activity.href}
        onClick={onNavigate}
        title={collapsed ? `${title} · ${progress}` : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-card transition-colors hover:border-[var(--action)]/50",
          collapsed ? "p-2" : "px-3 py-2",
        )}
      >
        {dot}
        {!collapsed && (
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold text-[var(--ink-primary)]">
              {title}
            </span>
            <span className="block truncate text-xs text-[var(--ink-muted)]">{`${text.activity} · ${progress}`}</span>
          </span>
        )}
      </Link>
    </div>
  );
};
