import type { ReactElement, ReactNode } from "react";

interface ReviewGroupProps {
  title: string;
  editLabel: string;
  onEdit: () => void;
  children: ReactNode;
}

interface ReviewFieldProps {
  label: string;
  children: ReactNode;
}

/** One block of the review summary, matching a wizard step, with a link back to that step. */
export const ReviewGroup = ({ title, editLabel, onEdit, children }: ReviewGroupProps): ReactElement => (
  <section className="p-5">
    <div className="mb-3 flex items-center justify-between gap-3">
      <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-md px-2 py-1 text-xs font-medium text-[var(--brand-ink)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--brand)]/35"
      >
        {editLabel}
      </button>
    </div>
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">{children}</dl>
  </section>
);

/** A label in small muted text over its value in medium weight, so the value is what the eye lands on. */
export const ReviewField = ({ label, children }: ReviewFieldProps): ReactElement => (
  <div className="min-w-0">
    <dt className="text-xs text-[var(--ink-muted)]">{label}</dt>
    <dd className="mt-0.5 break-words text-sm font-medium text-[var(--ink-primary)]">{children}</dd>
  </div>
);
