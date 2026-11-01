"use client";

import { useLocale } from "@pte/ui";
import {
  EDITOR_TEXT,
  HOST_TEMPLATES_TEXT,
  MODE_TEXT,
  SKILL_LABELS,
  type RedistributionMode,
} from "../constants";
import type { SkillName } from "@pte/api-client";

/** Translates every entry of a constants object under `tenant.hostTemplates.<group>.<KEY>`. */
function useGroupText<T extends Record<string, string>>(group: string, source: T): T {
  const { t } = useLocale();
  return Object.fromEntries(
    Object.entries(source).map(([key, fallback]) => [
      key,
      t(`tenant.hostTemplates.${group}.${key}`, fallback),
    ]),
  ) as T;
}

export const useListText = (): typeof HOST_TEMPLATES_TEXT =>
  useGroupText("list", HOST_TEMPLATES_TEXT);

export const useEditorText = (): typeof EDITOR_TEXT => useGroupText("editor", EDITOR_TEXT);

export function useSkillLabels(): Record<SkillName, string> {
  return useGroupText("skill", SKILL_LABELS);
}

export function useModeText(): Record<RedistributionMode, { label: string; hint: string }> {
  const { t } = useLocale();
  const entry = (mode: RedistributionMode): { label: string; hint: string } => ({
    label: t(`tenant.hostTemplates.mode.${mode}.label`, MODE_TEXT[mode].label),
    hint: t(`tenant.hostTemplates.mode.${mode}.hint`, MODE_TEXT[mode].hint),
  });
  return { PROPORTIONAL: entry("PROPORTIONAL"), EQUAL: entry("EQUAL"), MANUAL: entry("MANUAL") };
}
