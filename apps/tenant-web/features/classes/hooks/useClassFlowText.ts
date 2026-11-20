"use client";

import { useLocale } from "@pte/ui";
import { pluralize } from "../../orgLabels/constants";
import {
  CLASS_FLOW_EN,
  CLASS_FLOW_VI,
  type ClassFlowMessages,
} from "../constants/classFlowMessages";

type Values = Record<string, string | number>;

/** Derives the `{label}` variants every class-flow template can reference. */
export const classLabelValues = (label: string): Values => ({
  label,
  labelLower: label.toLowerCase(),
  labels: pluralize(label),
  labelsLower: pluralize(label.toLowerCase()),
});

export const useClassFlowText = (classLabel = "") => {
  const { locale, t } = useLocale();
  const catalog = locale === "vi" ? CLASS_FLOW_VI : CLASS_FLOW_EN;
  const base = classLabelValues(classLabel);
  return (key: keyof ClassFlowMessages, values: Values = {}): string =>
    t(`tenant.classFlows.${key}`, catalog[key], { ...base, ...values });
};
