"use client";

import type { ReactElement } from "react";
import { useStaffDetailText } from "@/features/examStaff/detail/hooks/useStaffDetailText";
import { StaffWorkspaceError } from "@/features/examStaff/detail/components/StaffWorkspaceError";

interface StaffDetailErrorProps { error: Error & { digest?: string }; unstable_retry: () => void }

const StaffDetailError = ({ unstable_retry }: StaffDetailErrorProps): ReactElement => {
  const text = useStaffDetailText();
  return <StaffWorkspaceError text={text} retry={unstable_retry} />;
};

export default StaffDetailError;
