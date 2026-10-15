import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";
import { PROCTOR_PICKER_TEXT } from "@/features/proctor/constants";

export const metadata: Metadata = {
  title: PROCTOR_PICKER_TEXT.AUDIT_LOG.PAGE_TITLE,
};

export default function ProctorAuditLogPickerPage(): ReactElement {
  return <AssignedSessionPicker mode="audit-log" />;
}
