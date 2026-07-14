import type { ReactElement, ReactNode } from "react";

interface TopBarProps {
  title?: ReactNode;
  actions?: ReactNode;
}

export const TopBar = ({ title, actions }: TopBarProps): ReactElement => (
  <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">{title}</div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);
