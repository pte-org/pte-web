import type { ReactElement, ReactNode } from "react";
import { ChevronRightIcon } from "./icons";
import { cn } from "../utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  renderLink?: (item: BreadcrumbItem) => ReactNode;
  dividerType?: "slash" | "chevron" | "dot";
  className?: string;
}

export const Breadcrumbs = ({
  items,
  renderLink,
  dividerType = "chevron",
  className,
}: BreadcrumbsProps): ReactElement => (
  <nav aria-label="Breadcrumb" className="text-sm">
    <ol className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const content = (
          <>
            {item.icon}
            {item.label}
          </>
        );

        return (
          <li key={`${item.label}-${index}`} className="contents [&_svg]:text-current">
            {index > 0 && <BreadcrumbDivider type={dividerType} />}
            {item.href && !isLast ? (
              renderLink ? (
                renderLink(item)
              ) : (
                <a
                  href={item.href}
                  className="flex items-center gap-1 font-medium text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink-primary)]"
                >
                  {content}
                </a>
              )
            ) : (
              <span className="flex items-center gap-1 font-medium text-[var(--ink-primary)]">
                {content}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

function BreadcrumbDivider({ type }: { type: BreadcrumbsProps["dividerType"] }): ReactElement {
  if (type === "dot") {
    return <span aria-hidden="true" className="size-1 rounded-full bg-[var(--ink-muted)]" />;
  }

  if (type === "slash") {
    return (
      <span aria-hidden="true" className="text-[var(--ink-muted)]">
        /
      </span>
    );
  }

  return <ChevronRightIcon className="h-4 w-4 text-[var(--ink-muted)]" />;
}
