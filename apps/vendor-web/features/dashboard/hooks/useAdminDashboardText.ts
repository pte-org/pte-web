"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import {
  ADMIN_DASHBOARD_EN,
  type AdminDashboardMessageKey,
  type AdminDashboardMessages,
} from "../messages/en";
import { ADMIN_DASHBOARD_VI } from "../messages/vi";
import { formatMessage, type MessageValues } from "../utils/format";

export interface AdminDashboardText {
  locale: Locale;
  messages: AdminDashboardMessages;
  format: (key: AdminDashboardMessageKey, values?: MessageValues) => string;
}

export function useAdminDashboardText(): AdminDashboardText {
  const { locale } = useLocale();

  return useMemo(() => {
    const messages = locale === "vi" ? ADMIN_DASHBOARD_VI : ADMIN_DASHBOARD_EN;
    return {
      locale,
      messages,
      format: (key, values) => formatMessage(messages[key], values),
    };
  }, [locale]);
}
