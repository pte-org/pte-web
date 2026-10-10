import type { ReactElement } from "react";

interface StudentDetailStateMessageProps {
  message: string;
}

export const StudentDetailStateMessage = ({
  message,
}: StudentDetailStateMessageProps): ReactElement => (
  <div className="rounded-lg bg-[var(--blush-tint)] px-4 py-3 text-sm text-[var(--blush-action)]">
    {message}
  </div>
);
