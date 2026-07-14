import type { ReactElement, ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({
  title,
  description,
  action,
}: EmptyStateProps): ReactElement => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
    {action}
  </div>
);
