import { useId, type ReactElement, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Button } from "./Button";
import { DashboardCard } from "./DashboardCard";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { Skeleton } from "./Skeleton";

export type DashboardPanelStatus = "content" | "loading" | "error" | "empty";

export interface DashboardPanelErrorProps {
  title: string;
  description?: string;
  retryLabel: string;
  /** Omit to hide the retry button (for example when the failure is not retryable). */
  onRetry?: () => void;
}

export interface DashboardPanelEmptyProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface DashboardPanelProps {
  title: string;
  subtitle?: string;
  /** Header actions such as a link or a select. */
  actions?: ReactNode;
  /** One primary navigation action shown below the panel content. */
  footerAction?: ReactNode;
  /** Defaults to "content". Only the matching state object below is read. */
  status?: DashboardPanelStatus;
  /** Screen-reader announcement while `status` is "loading". */
  loadingLabel?: string;
  /** Required in practice when `status` is "error"; the body stays empty without it. */
  error?: DashboardPanelErrorProps;
  /** Required in practice when `status` is "empty"; the body stays empty without it. */
  empty?: DashboardPanelEmptyProps;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}

const LOADING_ROW_WIDTHS = ["w-full", "w-5/6", "w-2/3"] as const;

const PanelLoading = ({ label }: { label?: string }): ReactElement => (
  <div role="status" aria-live="polite" className="space-y-3">
    {label && <span className="sr-only">{label}</span>}
    {LOADING_ROW_WIDTHS.map((width) => (
      <Skeleton key={width} className={cn("h-8", width)} />
    ))}
  </div>
);

const PanelError = ({ title, description, retryLabel, onRetry }: DashboardPanelErrorProps): ReactElement => (
  <div role="alert">
    <ErrorState
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="danger" appearance="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
    />
  </div>
);

/**
 * Titled dashboard surface with loading, error and empty bodies. All copy arrives via props,
 * and the panel carries no data-fetching logic: callers map their query state to `status`.
 */
export const DashboardPanel = ({
  title,
  subtitle,
  actions,
  footerAction,
  status = "content",
  loadingLabel,
  error,
  empty,
  children,
  className,
  contentClassName,
}: DashboardPanelProps): ReactElement => {
  const titleId = `dashboard-panel-title-${useId().replace(/:/g, "")}`;

  return (
    <DashboardCard
      role="region"
      aria-labelledby={titleId}
      aria-busy={status === "loading"}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-sm font-semibold text-[var(--ink-primary)]">
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-[var(--ink-secondary)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      </div>

      <div className={cn("min-w-0", contentClassName)}>
        {status === "loading" && <PanelLoading label={loadingLabel} />}
        {status === "error" && error && <PanelError {...error} />}
        {status === "empty" && empty && <EmptyState {...empty} />}
        {status === "content" && children}
      </div>

      {footerAction && (
        <div className="mt-auto border-t border-[var(--shell-border)]/60 pt-3">
          {footerAction}
        </div>
      )}
    </DashboardCard>
  );
};
