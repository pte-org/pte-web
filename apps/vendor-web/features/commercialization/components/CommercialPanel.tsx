import type { ReactElement, ReactNode } from "react";

interface CommercialPanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const CommercialPanel = ({
  title,
  subtitle,
  actions,
  children,
  className = "",
}: CommercialPanelProps): ReactElement => (
  <section className={`rounded-lg bg-white p-5 shadow-card ${className}`}>
    {(title || subtitle || actions) && (
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);
