"use client";

import Link from "next/link";
import type { ReactElement } from "react";

interface BreadcrumbBackToClassProps {
  className: string;
  programPublicId: string;
  classPublicId: string;
  organizationPublicId: string;
}

export const BreadcrumbBackToClass = ({
  className,
  programPublicId,
  classPublicId,
  organizationPublicId,
}: BreadcrumbBackToClassProps): ReactElement => (
  <nav aria-label={`Back to ${className}`}>
    <Link
      href={`/host/programs/${programPublicId}/classes/${classPublicId}?organizationPublicId=${organizationPublicId}`}
      className="text-sm font-medium text-blue-700 hover:underline"
    >
      {`← Back to ${className}`}
    </Link>
  </nav>
);
