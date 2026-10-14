"use client";

import { useLocale } from "@pte/ui";
import { TENANT_SEARCH_TEXT, type TenantSearchSurface } from "./constants";

export const useTenantSearchText = (surface: TenantSearchSurface): {
  placeholder: string;
  ariaLabel: string;
} => {
  const { t } = useLocale();
  const copy = TENANT_SEARCH_TEXT[surface];

  return {
    placeholder: t(`tenant.search.${surface}.placeholder`, copy.placeholder),
    ariaLabel: t(`tenant.search.${surface}.ariaLabel`, copy.ariaLabel),
  };
};
