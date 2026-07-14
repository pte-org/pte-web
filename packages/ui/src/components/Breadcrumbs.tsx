import type { ReactElement, ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  renderLink?: (item: BreadcrumbItem) => ReactNode;
}

export const Breadcrumbs = ({
  items,
  renderLink,
}: BreadcrumbsProps): ReactElement => (
  <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href && !isLast && renderLink ? (
              renderLink(item)
            ) : (
              <span className={isLast ? "font-medium text-gray-900" : undefined}>
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
