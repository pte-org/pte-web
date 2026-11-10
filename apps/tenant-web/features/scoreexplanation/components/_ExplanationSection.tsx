import type { ReactElement, ReactNode } from "react";

interface ExplanationSectionProps {
  title: string;
  hint?: string;
  children: ReactNode;
}

/** The card each step of the explanation sits in. */
export const ExplanationSection = ({ title, hint, children }: ExplanationSectionProps): ReactElement => (
  <section className="space-y-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
    <div>
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{title}</h2>
      {hint && <p className="mt-1 text-sm text-[var(--ink-secondary)]">{hint}</p>}
    </div>
    {children}
  </section>
);
