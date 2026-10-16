"use client";

import { useMemo } from "react";
import type { AudienceSourceRequest, SubscriptionResponse } from "@pte/api-client";
import { useSubscriptionsQuery, useTenantPlansQuery } from "@/features/commercialization/api";
import {
  useAudienceStudentPicker,
  type UseAudienceStudentPickerResult,
} from "./useAudienceStudentPicker";

export interface UseCreateExamAudienceOptions {
  open: boolean;
  sources: readonly AudienceSourceRequest[];
  onSourcesChange: (nextSources: AudienceSourceRequest[]) => void;
}

export interface UseCreateExamAudienceResult extends UseAudienceStudentPickerResult {
  activeSubscriptions: SubscriptionResponse[];
  subscriptionsLoading: boolean;
  planNameById: ReadonlyMap<string, string>;
}

export function useCreateExamAudience(
  options: UseCreateExamAudienceOptions,
): UseCreateExamAudienceResult {
  const picker = useAudienceStudentPicker(options);
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useSubscriptionsQuery();
  const { data: plans = [] } = useTenantPlansQuery();

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "ACTIVE"),
    [subscriptions],
  );
  const planNameById = useMemo(
    () => new Map(plans.map((plan) => [plan.publicId, plan.name] as const)),
    [plans],
  );

  return { ...picker, activeSubscriptions, subscriptionsLoading, planNameById };
}
