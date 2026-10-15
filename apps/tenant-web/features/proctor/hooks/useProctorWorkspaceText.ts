"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import {
  PROCTOR_WORKSPACE_EN,
  type ProctorWorkspaceMessageKey,
  type ProctorWorkspaceMessages,
} from "../messages/en";
import { PROCTOR_WORKSPACE_VI } from "../messages/vi";

export interface ProctorWorkspaceText extends ProctorWorkspaceMessages {
  locale: Locale;
  format: (key: ProctorWorkspaceMessageKey, values: Record<string, string | number>) => string;
}

export const useProctorWorkspaceText = (): ProctorWorkspaceText => {
  const { locale, t } = useLocale();
  return useMemo(() => {
    const catalog = locale === "vi" ? PROCTOR_WORKSPACE_VI : PROCTOR_WORKSPACE_EN;
    const messages = Object.fromEntries(
      Object.entries(catalog).map(([key, fallback]) => [
        key,
        t(`tenant.proctorWorkspace.${key}`, fallback),
      ]),
    ) as ProctorWorkspaceMessages;
    return {
      ...messages,
      locale,
      format: (key, values) => t(`tenant.proctorWorkspace.${key}`, catalog[key], values),
    };
  }, [locale, t]);
};
