"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ReactElement } from "react";
import { Button, ChevronLeftIcon } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";

interface BackLinkProps {
  /** Where to go when the page was not opened from another screen; with none, the link is only shown after one. */
  fallbackHref?: string;
  fallbackLabel?: string;
}

const CONTENT_HUB_PATH = "/admin/exam-studio";

/**
 * The way back from a page that another screen links to. The screen passes where it was, tab and filters
 * included, in `from`, so going back lands on the same view; only paths inside the admin area are followed.
 */
const BackLinkContent = ({ fallbackHref, fallbackLabel }: BackLinkProps): ReactElement | null => {
  const router = useRouter();
  const from = useSearchParams().get("from");
  const hubLabel = useAdminCopy("Back to the Content Hub");
  const genericLabel = useAdminCopy("Back");
  const fallbackLabelText = useAdminCopy(fallbackLabel ?? "Back");
  const safeFrom = from && from.startsWith("/admin/") && !from.startsWith("//") ? from : null;
  const target = safeFrom ?? fallbackHref;
  if (!target) return null;
  const label = safeFrom
    ? safeFrom.startsWith(CONTENT_HUB_PATH)
      ? hubLabel
      : genericLabel
    : fallbackLabel
      ? fallbackLabelText
      : genericLabel;

  return (
    <Button
      size="sm"
      variant="secondary"
      appearance="ghost"
      leftIcon={<ChevronLeftIcon className="h-4 w-4" />}
      onClick={() => router.push(target)}
    >
      {label}
    </Button>
  );
};

/** The suspense boundary lets a statically rendered page use this link, which reads the address. */
export const BackLink = (props: BackLinkProps): ReactElement => (
  <Suspense fallback={null}>
    <BackLinkContent {...props} />
  </Suspense>
);
