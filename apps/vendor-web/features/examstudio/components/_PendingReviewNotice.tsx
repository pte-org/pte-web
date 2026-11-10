import type { ReactElement } from "react";
import { Button } from "@pte/ui";

interface PendingReviewNoticeProps {
  /** Already worded, e.g. "3 questions are waiting for your review". */
  message: string;
  openLabel: string;
  onOpen: () => void;
}

/** For a reviewer: how many questions wait for them, with one click to the board. */
export const PendingReviewNotice = ({
  message,
  openLabel,
  onOpen,
}: PendingReviewNoticeProps): ReactElement => (
  <div
    role="status"
    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--cream-action)]/30 bg-[var(--cream-tint)] px-4 py-3 text-sm text-[var(--cream-action)]"
  >
    <span className="font-medium">{message}</span>
    <Button type="button" variant="secondary" size="sm" onClick={onOpen}>
      {openLabel}
    </Button>
  </div>
);
