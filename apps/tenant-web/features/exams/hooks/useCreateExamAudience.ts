"use client";

import { useCallback, useMemo, useState } from "react";
import type { AudienceSourceRequest, SubscriptionResponse } from "@pte/api-client";
import { useAllTenantClasses } from "@/features/classes/api";
import { useSubscriptionsQuery, useTenantPlansQuery } from "@/features/commercialization/api";
import { useTenantStudents } from "@/features/examoperations/api";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import { CREATE_EXAM_WIZARD_ERRORS } from "../constants";

export interface CreateExamAudienceOption {
  label: string;
  value: string;
}

export interface UseCreateExamAudienceOptions {
  open: boolean;
  sources: readonly AudienceSourceRequest[];
  onSourcesChange: (nextSources: AudienceSourceRequest[]) => void;
  onSourcesError: (message?: string) => void;
}

export interface UseCreateExamAudienceResult {
  activeSubscriptions: SubscriptionResponse[];
  subscriptionsLoading: boolean;
  planNameById: ReadonlyMap<string, string>;
  sourceType: AudienceSourceRequest["sourceType"];
  sourcePublicId: string;
  sourceSearch: string;
  sourceOptions: CreateExamAudienceOption[];
  sourceLabels: ReadonlyMap<string, string>;
  sourceLoading: boolean;
  onSourceTypeChange: (nextSourceType: AudienceSourceRequest["sourceType"]) => void;
  onSourcePublicIdChange: (nextSourcePublicId: string) => void;
  onSourceSearchChange: (nextSourceSearch: string) => void;
  addSource: () => void;
  removeSource: (index: number) => void;
}

export function useCreateExamAudience({
  open,
  sources,
  onSourcesChange,
  onSourcesError,
}: UseCreateExamAudienceOptions): UseCreateExamAudienceResult {
  const [sourceType, setSourceType] = useState<AudienceSourceRequest["sourceType"]>("STUDENT");
  const [sourcePublicId, setSourcePublicId] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useSubscriptionsQuery();
  const { data: plans = [] } = useTenantPlansQuery();
  const { data: tenantClasses = [], isLoading: classesLoading } = useAllTenantClasses(open);
  const { data: tenantStudents = [], isLoading: studentsLoading } = useTenantStudents(open);
  const { data: organizations = [] } = useMyOrganizations(open);
  const organizationPublicId = organizations[0]?.publicId ?? "";
  const { data: programs = [], isLoading: programsLoading } = usePrograms(
    organizationPublicId,
    open,
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "ACTIVE"),
    [subscriptions],
  );
  const planNameById = useMemo(
    () => new Map(plans.map((plan) => [plan.publicId, plan.name] as const)),
    [plans],
  );

  const normalizedSourceSearch = sourceSearch.trim().toLowerCase();
  const sourceOptions = useMemo(() => {
    const sourceMatchesSearch = (values: string[]): boolean =>
      !normalizedSourceSearch ||
      values.some((value) => value.toLowerCase().includes(normalizedSourceSearch));

    const allSourceOptions = [
      ...(sourceType === "STUDENT"
        ? tenantStudents
            .filter((student) => student.status === "ACTIVE")
            .map((student) => ({
              label: `${student.fullName} (${student.email})${student.studentCode ? ` · ${student.studentCode}` : ""}`,
              value: student.publicId,
              searchValues: [
                student.fullName,
                student.email,
                student.username,
                student.studentCode ?? "",
              ],
            }))
        : []),
      ...(sourceType === "CLASS"
        ? tenantClasses
            .filter((studentClass) => studentClass.status === "ACTIVE")
            .map((studentClass) => ({
              label: `${studentClass.className} (${studentClass.programName})`,
              value: studentClass.classPublicId,
              searchValues: [studentClass.className, studentClass.programName],
            }))
        : []),
      ...(sourceType === "PROGRAM"
        ? programs
            .filter((program) => program.status === "ACTIVE")
            .map((program) => ({
              label: program.name,
              value: program.publicId,
              searchValues: [program.name],
            }))
        : []),
    ];

    return allSourceOptions
      .filter((option) => sourceMatchesSearch(option.searchValues))
      .map(({ label, value }) => ({ label, value }));
  }, [normalizedSourceSearch, programs, sourceType, tenantClasses, tenantStudents]);

  const sourceLabels = useMemo(() => {
    const labels = new Map<string, string>();
    tenantStudents.forEach((student) =>
      labels.set(`STUDENT:${student.publicId}`, `${student.fullName} (${student.email})`),
    );
    tenantClasses.forEach((studentClass) =>
      labels.set(
        `CLASS:${studentClass.classPublicId}`,
        `${studentClass.className} (${studentClass.programName})`,
      ),
    );
    programs.forEach((program) => labels.set(`PROGRAM:${program.publicId}`, program.name));
    return labels;
  }, [programs, tenantClasses, tenantStudents]);

  const sourceLoading =
    sourceType === "STUDENT"
      ? studentsLoading
      : sourceType === "CLASS"
        ? classesLoading
        : programsLoading;

  const onSourceTypeChange = useCallback(
    (nextSourceType: AudienceSourceRequest["sourceType"]): void => {
      setSourceType(nextSourceType);
      setSourcePublicId("");
      setSourceSearch("");
    },
    [],
  );

  const onSourcePublicIdChange = useCallback((nextSourcePublicId: string): void => {
    setSourcePublicId(nextSourcePublicId);
  }, []);

  const onSourceSearchChange = useCallback((nextSourceSearch: string): void => {
    setSourceSearch(nextSourceSearch);
    setSourcePublicId("");
  }, []);

  const addSource = useCallback((): void => {
    const normalizedId = sourcePublicId.trim();
    if (!normalizedId) {
      onSourcesError(CREATE_EXAM_WIZARD_ERRORS.SOURCE_REQUIRED);
      return;
    }
    if (
      sources.some(
        (source) => source.sourceType === sourceType && source.sourcePublicId === normalizedId,
      )
    ) {
      onSourcesError(CREATE_EXAM_WIZARD_ERRORS.SOURCE_DUPLICATE);
      return;
    }

    onSourcesChange([...sources, { sourceType, sourcePublicId: normalizedId }]);
    setSourcePublicId("");
    setSourceSearch("");
  }, [onSourcesChange, onSourcesError, sources, sourcePublicId, sourceType]);

  const removeSource = useCallback(
    (index: number): void => {
      onSourcesChange(sources.filter((_, sourceIndex) => sourceIndex !== index));
    },
    [onSourcesChange, sources],
  );

  return {
    activeSubscriptions,
    subscriptionsLoading,
    planNameById,
    sourceType,
    sourcePublicId,
    sourceSearch,
    sourceOptions,
    sourceLabels,
    sourceLoading,
    onSourceTypeChange,
    onSourcePublicIdChange,
    onSourceSearchChange,
    addSource,
    removeSource,
  };
}
