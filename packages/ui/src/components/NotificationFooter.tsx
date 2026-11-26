"use client";

import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { DisclosureChevron } from "./DisclosureChevron";
import { Button } from "./Button";

interface NotificationFooterProps {
  isExpanded: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore?: () => void;
  onCollapse?: () => void;
  /** Opens the full notification list; shown as a link at the foot of the panel. */
  onViewAll?: () => void;
}

export const NotificationFooter = ({
  isExpanded,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onCollapse,
  onViewAll,
}: NotificationFooterProps): ReactElement | null => {
  const { t } = useLocale();
  const canLoadMore = hasMore && Boolean(onLoadMore);
  const canCollapse = isExpanded && Boolean(onCollapse);

  if (!canLoadMore && !canCollapse && !onViewAll) return null;

  return (
    <div className="flex flex-wrap gap-2 border-t border-[var(--shell-border)] p-2">
      {canCollapse && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          className={canLoadMore ? "flex-1" : undefined}
          aria-label={t("common.collapseNotifications", "Collapse")}
          title={t("common.collapseNotifications", "Collapse")}
          onClick={onCollapse}
        >
          <DisclosureChevron expanded />
        </Button>
      )}
      {canLoadMore && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          className={canCollapse ? "flex-1" : undefined}
          isLoading={isLoadingMore}
          onClick={onLoadMore}
        >
          {t("common.loadMoreNotifications", "Load more notifications")}
        </Button>
      )}
      {onViewAll && (
        <Button variant="ghost" size="sm" fullWidth onClick={onViewAll}>
          {t("common.notificationsViewAll", "View all notifications")} →
        </Button>
      )}
    </div>
  );
};
