import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";

export const metadata: Metadata = {
  title: "Nhật ký ca thi | Giám thị",
};

export default function ProctorAuditLogPickerPage(): ReactElement {
  return (
    <AssignedSessionPicker
      mode="audit-log"
      title="Nhật ký ca thi"
      subtitle="Chọn một ca thi được phân công để xem nhật ký giám sát và vi phạm"
    />
  );
}
