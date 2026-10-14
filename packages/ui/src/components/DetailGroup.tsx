import type { ReactElement, ReactNode } from "react";
import {
  DescriptionList,
  type DescriptionItem,
  type DescriptionListVariant,
} from "./DescriptionList";

interface DetailGroupProps {
  title: string;
  items: DescriptionItem[];
  icon?: ReactNode;
  variant?: DescriptionListVariant;
}

/** A labeled subsection of a detail card — splits a long flat field list into scannable groups. */
export const DetailGroup = ({
  title,
  items,
  icon,
  variant = "stacked",
}: DetailGroupProps): ReactElement => (
  <div className="border-t border-[var(--divider)] pt-5 first:border-t-0 first:pt-0">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--ink-primary)]">
      {icon && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--action-tint)] text-[var(--action)]">
          {icon}
        </span>
      )}
      <span>{title}</span>
    </h3>
    <DescriptionList items={items} variant={variant} />
  </div>
);
