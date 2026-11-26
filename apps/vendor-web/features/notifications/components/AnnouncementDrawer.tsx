"use client";

import type { ReactElement, ReactNode } from "react";
import type { AnnouncementResponse } from "@pte/api-client";
import {
  Badge,
  Button,
  CheckCircleIcon,
  Drawer,
  PencilIcon,
  ProgressBar,
  TrashIcon,
  formatShortDateTime,
  useLocale,
} from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useAnnouncementAudiencePreview } from "../announcementsApi";

interface AnnouncementDrawerProps {
  /** The announcement to show; null keeps the drawer closed. */
  announcement: AnnouncementResponse | null;
  onClose: () => void;
  onEdit: (announcement: AnnouncementResponse) => void;
  onPublish: (announcement: AnnouncementResponse) => void;
  onDelete: (announcement: AnnouncementResponse) => void;
  onRetry: (announcement: AnnouncementResponse) => void;
  isRetrying: boolean;
}

const Section = ({
  title,
  children,
  divided = false,
}: {
  title: string;
  children: ReactNode;
  /** A rule above the section, to set it apart from the one before. */
  divided?: boolean;
}): ReactElement => (
  <section className={divided ? "space-y-2 border-t border-[var(--shell-border)] pt-6" : "space-y-2"}>
    <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">{title}</h3>
    {children}
  </section>
);

const Row = ({ label, value }: { label: string; value: ReactNode }): ReactElement => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <dt className="text-[var(--ink-secondary)]">{label}</dt>
    <dd className="text-right font-medium text-[var(--ink-primary)]">{value}</dd>
  </div>
);

const PERCENT = 100;

/** What a draft will reach: the organizations that would receive it, counted when the drawer opens. */
const DraftAudience = ({ publicId, label }: { publicId: string; label: string }): ReactElement => {
  const audience = useAnnouncementAudiencePreview(publicId);
  return <Row label={label} value={audience.data?.eligibleTenantCount ?? "—"} />;
};

/**
 * One announcement beside the list, so a run of them can be read without losing the filter or the place in the table:
 * its text, where it went (or who it would reach), and the actions its state allows.
 */
export function AnnouncementDrawer({
  announcement,
  onClose,
  onEdit,
  onPublish,
  onDelete,
  onRetry,
  isRetrying,
}: AnnouncementDrawerProps): ReactElement | null {
  const { locale } = useLocale();
  const lang = locale === "vi" ? "vi" : "en";
  const T = useAdminCopy({
    TITLE: "Announcement details",
    PUBLISHED: "Published",
    DRAFT: "Draft",
    PUBLISHED_AT: "Published",
    UPDATED_AT: "Updated",
    CONTENT: "Message",
    RESULT: "Delivery result",
    SENT: "Sent",
    PENDING: "Waiting",
    FAILED: "Failed",
    SUPPRESSED: "Skipped",
    READ: "Read",
    ELIGIBLE: "Eligible organizations",
    ABOUT: "General information",
    CATEGORY: "Category",
    AFFECTED_FROM: "Affected from",
    AFFECTED_UNTIL: "Affected until",
    EDIT: "Edit",
    PUBLISH: "Publish",
    DELETE: "Delete draft",
    RETRY: "Retry failed deliveries",
    CLOSE: "Close",
  });
  const categoryLabels = useAdminCopy({
    SYSTEM_NOTICE: "System notice",
    MAINTENANCE: "Maintenance",
    SESSION: "Session",
    APPLICATION: "Application",
    BILLING: "Billing",
  });
  const importanceLabels = useAdminCopy({ INFO: "Informational", IMPORTANT: "Important" });
  if (!announcement) return null;

  const when = (iso: string | null): string => (iso ? formatShortDateTime(iso, lang) : "—");
  // A draft comes with zero counts from the server; they mean "not sent yet", so only a published one has a result.
  const delivery = announcement.published ? announcement.delivery : null;
  const percent =
    delivery && delivery.audienceCount > 0
      ? Math.round((delivery.deliveredCount / delivery.audienceCount) * PERCENT)
      : 0;

  return (
    <Drawer
      open
      onClose={onClose}
      title={announcement.title}
      description={
        announcement.published
          ? `${T.PUBLISHED_AT} ${when(announcement.publishedAt)}`
          : `${T.UPDATED_AT} ${when(announcement.updatedAt)}`
      }
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {announcement.published ? (
            <>
              {delivery && delivery.failedCount > 0 && (
                <Button variant="secondary" isLoading={isRetrying} onClick={() => onRetry(announcement)}>
                  {T.RETRY}
                </Button>
              )}
              <Button variant="secondary" onClick={onClose}>
                {T.CLOSE}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" leftIcon={<TrashIcon className="h-4 w-4" />} onClick={() => onDelete(announcement)}>
                {T.DELETE}
              </Button>
              <Button variant="secondary" leftIcon={<PencilIcon className="h-4 w-4" />} onClick={() => onEdit(announcement)}>
                {T.EDIT}
              </Button>
              <Button leftIcon={<CheckCircleIcon className="h-4 w-4" />} onClick={() => onPublish(announcement)}>
                {T.PUBLISH}
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={announcement.importance === "IMPORTANT" ? "warning" : "info"}>
            {importanceLabels[announcement.importance as keyof typeof importanceLabels] ?? announcement.importance}
          </Badge>
          <Badge variant={announcement.published ? "success" : "warning"}>
            {announcement.published ? T.PUBLISHED : T.DRAFT}
          </Badge>
        </div>

        <Section title={T.CONTENT}>
          <p className="whitespace-pre-wrap break-words rounded-lg border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--ink-primary)]">
            {announcement.body}
          </p>
        </Section>

        <Section title={T.RESULT}>
          {delivery ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ink-secondary)]">{T.SENT}</span>
                <span className="font-medium text-[var(--ink-primary)]">
                  {delivery.deliveredCount} / {delivery.audienceCount} ({percent}%)
                </span>
              </div>
              <ProgressBar value={delivery.deliveredCount} max={Math.max(delivery.audienceCount, 1)} label={T.RESULT} />
              <dl className="space-y-2 pt-1">
                <Row label={T.PENDING} value={delivery.pendingCount} />
                <Row label={T.FAILED} value={delivery.failedCount} />
                <Row label={T.SUPPRESSED} value={delivery.suppressedCount} />
                {/* Reading is a share of those who received it, not a count on its own. */}
                <Row
                  label={T.READ}
                  value={
                    delivery.deliveredCount > 0
                      ? `${delivery.readCount} / ${delivery.deliveredCount} (${Math.round((delivery.readCount / delivery.deliveredCount) * PERCENT)}%)`
                      : delivery.readCount
                  }
                />
              </dl>
            </div>
          ) : (
            <dl>
              <DraftAudience publicId={announcement.publicId} label={T.ELIGIBLE} />
            </dl>
          )}
        </Section>

        <Section title={T.ABOUT} divided>
          <dl className="space-y-2">
            <Row
              label={T.CATEGORY}
              value={categoryLabels[announcement.category as keyof typeof categoryLabels] ?? announcement.category}
            />
            <Row label={T.AFFECTED_FROM} value={when(announcement.affectedFrom)} />
            <Row label={T.AFFECTED_UNTIL} value={when(announcement.affectedUntil)} />
            <Row label={T.UPDATED_AT} value={when(announcement.updatedAt)} />
          </dl>
        </Section>
      </div>
    </Drawer>
  );
}
