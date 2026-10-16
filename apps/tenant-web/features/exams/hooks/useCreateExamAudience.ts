"use client";

import { useCallback, useMemo, useState } from "react";
import type { AudienceSourceRequest, SubscriptionResponse } from "@pte/api-client";
import { useAllTenantClasses } from "@/features/classes/api";
import { useSubscriptionsQuery, useTenantPlansQuery } from "@/features/commercialization/api";
import { useTenantStudents } from "@/features/examoperations/api";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import { useClassMemberships } from "@/features/studentSearch/api";
import { AUDIENCE_FILTER_ALL, AUDIENCE_FILTER_NO_CLASS } from "../constants";

export interface CreateExamAudienceOption {
  label: string;
  value: string;
}

export interface CreateExamAudienceStudent {
  publicId: string;
  fullName: string;
  /** Email and student code, joined for the secondary line of a row. */
  contact: string;
  /** Program and class, or `undefined` when the student has no class yet. */
  group?: { className: string; programName: string };
}

export interface UseCreateExamAudienceOptions {
  open: boolean;
  sources: readonly AudienceSourceRequest[];
  onSourcesChange: (nextSources: AudienceSourceRequest[]) => void;
}

export interface UseCreateExamAudienceResult {
  activeSubscriptions: SubscriptionResponse[];
  subscriptionsLoading: boolean;
  planNameById: ReadonlyMap<string, string>;
  search: string;
  programFilter: string;
  classFilter: string;
  programOptions: CreateExamAudienceOption[];
  classOptions: CreateExamAudienceOption[];
  /** Students matching the current filters, in display order. */
  students: CreateExamAudienceStudent[];
  selectedIds: ReadonlySet<string>;
  /** How many of the filtered students are currently selected. */
  selectedInFilterCount: number;
  loading: boolean;
  onSearchChange: (search: string) => void;
  onProgramFilterChange: (programPublicId: string) => void;
  onClassFilterChange: (classPublicId: string) => void;
  toggleStudent: (studentPublicId: string) => void;
  /** Selects every filtered student, or deselects them all when they already are. */
  toggleAllFiltered: () => void;
  clearSelection: () => void;
}

export function useCreateExamAudience({
  open,
  sources,
  onSourcesChange,
}: UseCreateExamAudienceOptions): UseCreateExamAudienceResult {
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState(AUDIENCE_FILTER_ALL);
  const [classFilter, setClassFilter] = useState(AUDIENCE_FILTER_ALL);

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
  const { data: classMemberships = [], isLoading: membershipsLoading } = useClassMemberships();

  const membershipByStudent = useMemo(
    () =>
      new Map(classMemberships.map((membership) => [membership.studentPublicId, membership] as const)),
    [classMemberships],
  );

  const activeSubscriptions = useMemo(
    () => subscriptions.filter((subscription) => subscription.status === "ACTIVE"),
    [subscriptions],
  );
  const planNameById = useMemo(
    () => new Map(plans.map((plan) => [plan.publicId, plan.name] as const)),
    [plans],
  );

  const programOptions = useMemo(
    () =>
      programs
        .filter((program) => program.status === "ACTIVE")
        .map((program) => ({ label: program.name, value: program.publicId })),
    [programs],
  );
  const classOptions = useMemo(
    () =>
      tenantClasses
        .filter(
          (studentClass) =>
            studentClass.status === "ACTIVE" &&
            (programFilter === AUDIENCE_FILTER_ALL || studentClass.programPublicId === programFilter),
        )
        .map((studentClass) => ({
          label:
            programFilter === AUDIENCE_FILTER_ALL
              ? `${studentClass.className} (${studentClass.programName})`
              : studentClass.className,
          value: studentClass.classPublicId,
        })),
    [programFilter, tenantClasses],
  );

  const normalizedSearch = search.trim().toLowerCase();
  const students = useMemo<CreateExamAudienceStudent[]>(
    () =>
      tenantStudents
        .filter((student) => student.status === "ACTIVE")
        .flatMap((student) => {
          const membership = membershipByStudent.get(student.publicId);
          if (programFilter !== AUDIENCE_FILTER_ALL && membership?.programPublicId !== programFilter) {
            return [];
          }
          if (classFilter === AUDIENCE_FILTER_NO_CLASS) {
            if (membership) return [];
          } else if (classFilter !== AUDIENCE_FILTER_ALL && membership?.classPublicId !== classFilter) {
            return [];
          }
          if (
            normalizedSearch &&
            ![student.fullName, student.email, student.username, student.studentCode ?? ""].some(
              (value) => value.toLowerCase().includes(normalizedSearch),
            )
          ) {
            return [];
          }
          return [
            {
              publicId: student.publicId,
              fullName: student.fullName,
              contact: [student.email, student.studentCode].filter(Boolean).join(" · "),
              group: membership
                ? { className: membership.className, programName: membership.programName }
                : undefined,
            },
          ];
        })
        .sort((left, right) => left.fullName.localeCompare(right.fullName)),
    [classFilter, membershipByStudent, normalizedSearch, programFilter, tenantStudents],
  );

  const selectedIds = useMemo(
    () =>
      new Set(
        sources
          .filter((source) => source.sourceType === "STUDENT")
          .map((source) => source.sourcePublicId),
      ),
    [sources],
  );
  const selectedInFilterCount = useMemo(
    () => students.filter((student) => selectedIds.has(student.publicId)).length,
    [selectedIds, students],
  );

  const onSearchChange = useCallback((nextSearch: string): void => setSearch(nextSearch), []);
  const onProgramFilterChange = useCallback((programPublicId: string): void => {
    setProgramFilter(programPublicId);
    // A class filter from another program would silently match nobody.
    setClassFilter(AUDIENCE_FILTER_ALL);
  }, []);
  const onClassFilterChange = useCallback(
    (classPublicId: string): void => setClassFilter(classPublicId),
    [],
  );

  const toggleStudent = useCallback(
    (studentPublicId: string): void => {
      onSourcesChange(
        selectedIds.has(studentPublicId)
          ? sources.filter(
              (source) =>
                !(source.sourceType === "STUDENT" && source.sourcePublicId === studentPublicId),
            )
          : [...sources, { sourceType: "STUDENT", sourcePublicId: studentPublicId }],
      );
    },
    [onSourcesChange, selectedIds, sources],
  );

  const toggleAllFiltered = useCallback((): void => {
    if (students.length === 0) return;
    const filteredIds = new Set(students.map((student) => student.publicId));
    if (selectedInFilterCount === students.length) {
      onSourcesChange(
        sources.filter(
          (source) => !(source.sourceType === "STUDENT" && filteredIds.has(source.sourcePublicId)),
        ),
      );
      return;
    }
    onSourcesChange([
      ...sources,
      ...students
        .filter((student) => !selectedIds.has(student.publicId))
        .map((student) => ({ sourceType: "STUDENT" as const, sourcePublicId: student.publicId })),
    ]);
  }, [onSourcesChange, selectedIds, selectedInFilterCount, sources, students]);

  const clearSelection = useCallback((): void => onSourcesChange([]), [onSourcesChange]);

  return {
    activeSubscriptions,
    subscriptionsLoading,
    planNameById,
    search,
    programFilter,
    classFilter,
    programOptions,
    classOptions,
    students,
    selectedIds,
    selectedInFilterCount,
    loading: studentsLoading || classesLoading || programsLoading || membershipsLoading,
    onSearchChange,
    onProgramFilterChange,
    onClassFilterChange,
    toggleStudent,
    toggleAllFiltered,
    clearSelection,
  };
}
