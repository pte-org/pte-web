"use client";

import type { ReactElement } from "react";
import { useLocale } from "../i18n";
import { Button } from "./Button";

interface NotificationFooterProps {
  isExpanded: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore?: () => void;
  onCollapse?: () => void;
}

export const NotificationFooter = ({
  isExpanded,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onCollapse,
}: NotificationFooterProps): ReactElement | null => {
  const { t } = useLocale();
  const canLoadMore = hasMore && Boolean(onLoadMore);
  const canCollapse = isExpanded && Boolean(onCollapse);

  if (!canLoadMore && !canCollapse) return null;

  return (
    <div className="flex gap-2 border-t border-[var(--shell-border)] p-2">
      {canCollapse && (
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          className={canLoadMore ? "flex-1" : undefined}
          onClick={onCollapse}
        >
          {t("common.collapseNotifications", "Collapse")}
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
    </div>
  );
};
