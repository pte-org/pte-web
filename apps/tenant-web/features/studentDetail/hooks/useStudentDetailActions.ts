"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getUserFacingApiErrorMessage, type StudentDetailResponse } from "@pte/api-client";
import { BanIcon, ShieldIcon, type DropdownItem } from "@pte/ui";
import { useGenerateStudentCredentials, type GeneratedCredentials } from "@/features/userManagement";
import { useReactivateStudent, useSuspendStudent } from "@/features/studentSearch/api";
import { STUDENT_DETAIL_QUERY_KEY } from "../api";
import type { StudentDetailText } from "./useStudentDetailText";

export const useStudentDetailActions = (
  publicId: string, account: StudentDetailResponse | undefined, text: StudentDetailText,
): {
  items: DropdownItem[]; error: string | null; suspendError: string | null;
  suspendOpen: boolean; closeSuspend: () => void; confirmSuspend: () => void;
  suspending: boolean; credentials: GeneratedCredentials | null; closeCredentials: () => void;
} => {
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const suspend = useSuspendStudent();
  const reactivate = useReactivateStudent();
  const generate = useGenerateStudentCredentials();
  const queryClient = useQueryClient();
  const resetErrors = (): void => { suspend.reset(); reactivate.reset(); generate.reset(); };
  const invalidate = (): void => {
    void queryClient.invalidateQueries({ queryKey: [...STUDENT_DETAIL_QUERY_KEY, publicId] });
  };
  const suspendError = suspend.error ? getUserFacingApiErrorMessage(suspend.error, text.genericError) : null;
  const rawError = suspend.error ?? reactivate.error ?? generate.error;
  const items: DropdownItem[] = [
    {
      label: text.actions.generatePassword, icon: ShieldIcon, disabled: generate.isPending,
      onSelect: () => { resetErrors(); generate.mutate(publicId, { onSuccess: setCredentials }); },
    },
    { separator: true, key: "student-detail-actions-separator" },
    account?.status === "SUSPENDED" ? {
      label: text.actions.reactivate, icon: ShieldIcon, disabled: reactivate.isPending,
      onSelect: () => { resetErrors(); reactivate.mutate(publicId, { onSuccess: invalidate }); },
    } : {
      label: text.actions.suspend, icon: BanIcon, danger: true,
      onSelect: () => { resetErrors(); setSuspendOpen(true); },
    },
  ];
  return {
    items, error: rawError ? getUserFacingApiErrorMessage(rawError, text.genericError) : null,
    suspendError, suspendOpen, suspending: suspend.isPending, credentials,
    closeSuspend: () => setSuspendOpen(false), closeCredentials: () => setCredentials(null),
    confirmSuspend: () => {
      resetErrors();
      suspend.mutate(publicId, { onSuccess: () => { setSuspendOpen(false); invalidate(); } });
    },
  };
};
