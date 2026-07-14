import type { ReactElement, ReactNode } from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const ErrorState = ({
  title,
  description,
  action,
}: ErrorStateProps): ReactElement => (
  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-4 text-red-800">
    <h3 className="text-sm font-semibold">{title}</h3>
    {description && <p className="mt-1 text-sm">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
