import type { ReactElement, ReactNode } from "react";

interface RubricSectionProps {
  title: string;
  hint?: string;
  /** Rendered next to the title, e.g. the "uncalibrated" badge of the Azure table. */
  badge?: ReactNode;
  children: ReactNode;
}

/** The card every block of the rubric detail page sits in. */
export const RubricSection = ({ title, hint, badge, children }: RubricSectionProps): ReactElement => (
  <section className="space-y-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">{title}</h2>
        {badge}
      </div>
      {hint && <p className="mt-1 text-sm text-[var(--ink-secondary)]">{hint}</p>}
    </div>
    {children}
  </section>
);
