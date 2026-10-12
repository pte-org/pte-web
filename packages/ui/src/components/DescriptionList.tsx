import type { ReactElement, ReactNode } from "react";

export interface DescriptionItem {
  label: string;
  value: ReactNode;
  /** Spans both columns — use on a trailing odd-one-out item so it doesn't leave the other column's row empty. */
  fullWidth?: boolean;
}

export type DescriptionListVariant = "stacked" | "inline";

interface DescriptionListProps {
  items: DescriptionItem[];
  variant?: DescriptionListVariant;
}

export const DescriptionList = ({
  items,
  variant = "stacked",
}: DescriptionListProps): ReactElement => {
  const isInline = variant === "inline";

  return (
    <dl
      className={
        isInline
          ? "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2"
      }
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={[
            item.fullWidth ? "sm:col-span-2" : undefined,
            isInline
              ? "grid grid-cols-[minmax(6rem,auto)_minmax(0,1fr)] items-baseline gap-x-2 max-[383px]:grid-cols-1 max-[383px]:gap-y-1"
              : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <dt
            className={
              isInline
                ? "min-w-0 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-muted)]"
                : "text-xs font-semibold uppercase text-gray-500"
            }
          >
            {item.label}
          </dt>
          <dd
            className={
              isInline
                ? "min-w-0 break-words text-sm font-medium text-[var(--ink-primary)] max-[383px]:mt-0"
                : "mt-1 text-sm text-gray-900"
            }
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};
