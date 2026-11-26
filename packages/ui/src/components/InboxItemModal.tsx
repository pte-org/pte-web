"use client";

import type { InboxItemResponse } from "@pte/api-client";
import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { inboxBadgeVariant } from "./inboxCategoryVariant";
import { Modal } from "./Modal";
import { useInboxItemText } from "./useInboxItemText";

interface InboxItemModalProps {
  /** The notification to read; null keeps the dialog closed. */
  item: InboxItemResponse | null;
  onClose: () => void;
}

const InboxItemReader = ({
  item,
  onClose,
}: {
  item: InboxItemResponse;
  onClose: () => void;
}): ReactElement => {
  const { t } = useLocale();
  const text = useInboxItemText(item);

  return (
    <Modal
      open
      onClose={onClose}
      closeOnBackdropClick
      size="lg"
      title={text.title}
      footer={
        <Button variant="secondary" onClick={onClose}>
          {t("common.close", "Close")}
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={inboxBadgeVariant(item)}>{text.categoryLabel}</Badge>
        <time dateTime={item.deliveredAt} className="text-xs text-[var(--ink-muted)]">
          {text.time}
        </time>
      </div>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--ink-secondary)]">{text.body}</p>
    </Modal>
  );
};

/**
 * A notification that only carries a message (a system notice, a maintenance warning), read in place: it has no page
 * of its own to go to, so the full text opens over whatever screen the reader is on.
 */
export const InboxItemModal = ({ item, onClose }: InboxItemModalProps): ReactElement | null =>
  item ? <InboxItemReader item={item} onClose={onClose} /> : null;
