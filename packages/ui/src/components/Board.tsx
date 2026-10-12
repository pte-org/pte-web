import type { ReactElement, ReactNode } from "react";
import { DashboardCard } from "./DashboardCard";
import { CollapsibleSection } from "./CollapsibleSection";
import { cn } from "../utils/cn";

export interface BoardProps {
  label: string;
  children: ReactNode;
  columns?: 3 | 4;
}
export interface BoardColumnProps {
  title: string;
  summary?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  collapsible?: boolean;
}

/** Presentation only: consumers own records, counts, requests and pagination. */
export const Board = ({ label, children, columns = 3 }: BoardProps): ReactElement => (
  <div
    role="group"
    aria-label={label}
    className={cn(
      "grid min-w-0 gap-4",
      columns === 4 ? "lg:grid-cols-2 xl:grid-cols-4" : "xl:grid-cols-3",
    )}
  >
    {children}
  </div>
);

export const BoardColumn = ({
  title,
  summary,
  actions,
  children,
  footer,
  collapsible = true,
}: BoardColumnProps): ReactElement => (
  <DashboardCard>
    <CollapsibleSection
      title={title}
      subtitle={summary}
      actions={actions}
      collapsible={collapsible}
    >
      <div className="flex min-w-0 flex-col gap-4">
        {children}
        {footer}
      </div>
    </CollapsibleSection>
  </DashboardCard>
);
