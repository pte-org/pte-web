"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import { pluralize } from "@/features/orgLabels/constants";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { HOST_DASHBOARD_EN, type HostDashboardMessageKey, type HostDashboardMessages } from "../messages/en";
import { HOST_DASHBOARD_VI } from "../messages/vi";
import { formatMessage, type MessageValues } from "../utils/format";

export interface HostDashboardText {
  locale: Locale;
  messages: HostDashboardMessages;
  /** Message with run-time placeholders (`{count}`, `{days}`, ...) filled in. */
  format: (key: HostDashboardMessageKey, values?: MessageValues) => string;
}

/**
 * Copy for the host dashboard in the active locale. Organisation nouns (`{program}`, `{class}`
 * and their plurals) are filled from the tenant's own labels once, so components only pass
 * run-time values. Both catalogs are typed against the same keys.
 */
export function useHostDashboardText(): HostDashboardText {
  const { locale } = useLocale();
  const labels = useOrgLabels();

  return useMemo(() => {
    const catalog: HostDashboardMessages = locale === "vi" ? HOST_DASHBOARD_VI : HOST_DASHBOARD_EN;
    const organisationNouns: MessageValues = {
      program: labels.program,
      programs: pluralize(labels.program),
      class: labels.class,
      classes: pluralize(labels.class),
      classLower: labels.class.toLowerCase(),
    };
    const messages = Object.fromEntries(
      Object.entries(catalog).map(([key, template]) => [key, formatMessage(template, organisationNouns)]),
      // Entries are produced from a catalog that is complete for every message key.
    ) as HostDashboardMessages;
    return {
      locale,
      messages,
      format: (key, values) => formatMessage(messages[key], values),
    };
  }, [locale, labels.program, labels.class]);
}
