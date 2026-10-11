import type { ReactElement, ReactNode } from "react";
import { DashboardCard } from "./DashboardCard";
import { CollapsibleSection } from "./CollapsibleSection";

export interface BoardProps { label: string; children: ReactNode }
export interface BoardColumnProps {
  title: string;
  summary?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Presentation only: consumers own records, counts, requests and pagination. */
export const Board = ({ label, children }: BoardProps): ReactElement => (
  <div role="group" aria-label={label} className="grid min-w-0 gap-4 xl:grid-cols-3">{children}</div>
);

export const BoardColumn = ({ title, summary, actions, children, footer }: BoardColumnProps): ReactElement => (
  <DashboardCard>
    <CollapsibleSection title={title} subtitle={summary} actions={actions}>
      <div className="flex min-w-0 flex-col gap-4">{children}{footer}</div>
    </CollapsibleSection>
  </DashboardCard>
);
