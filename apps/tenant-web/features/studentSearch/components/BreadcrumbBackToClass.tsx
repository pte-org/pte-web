"use client";

import type { ReactElement } from "react";
import { AppBackButton } from "@/features/navigation/components/AppBackButton";

interface BreadcrumbBackToClassProps {
  className: string;
  programPublicId: string;
  classPublicId: string;
  organizationPublicId: string;
}

/**
 * Renders a "Back to {className}" affordance. Used by the student search page
 * when the user was deep-linked from a class. Kept as its own component for
 * forward compatibility (future: add class status / row count), but the UI is
 * delegated to the shared `BackButton` so every Back affordance looks the
 * same.
 */
export const BreadcrumbBackToClass = ({
  className,
  programPublicId,
  classPublicId,
  organizationPublicId,
}: BreadcrumbBackToClassProps): ReactElement => (
  <AppBackButton
    href={`/host/programs/${programPublicId}/classes/${classPublicId}?organizationPublicId=${organizationPublicId}`}
    label={`Back to ${className}`}
  />
);
