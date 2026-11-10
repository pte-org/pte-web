import type { ReactElement, ReactNode } from "react";
import { cn } from "@pte/ui";
import { EXAMINER_COLUMN_CLASS, EXAMINER_COLUMN_TONE, type ExaminerColumnTone } from "../constants";

interface ExaminerColumnProps {
  title: string;
  tone: ExaminerColumnTone;
  children: ReactNode;
  /** Optional control at the right of the column title. */
  action?: ReactNode;
}

/** One of the three side-by-side marking columns; each scrolls on its own on wide screens. */
export const ExaminerColumn = ({ title, tone, children, action }: ExaminerColumnProps): ReactElement => (
  <section aria-label={title} className={cn(EXAMINER_COLUMN_CLASS, EXAMINER_COLUMN_TONE[tone].column)}>
    <div className="flex items-center justify-between gap-2 px-1">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-primary)]">
        <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", EXAMINER_COLUMN_TONE[tone].dot)} />
        {title}
      </h3>
      {action}
    </div>
    {children}
  </section>
);
