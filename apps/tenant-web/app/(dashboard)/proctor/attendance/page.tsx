import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";

export const metadata: Metadata = {
  title: "Điểm danh ca thi | Giám thị",
};

export default function ProctorAttendancePickerPage(): ReactElement {
  return (
    <AssignedSessionPicker
      mode="attendance"
      title="Điểm danh ca thi"
      subtitle="Chọn ca thi bạn được phân công giám thị để thực hiện điểm danh thí sinh."
    />
  );
}
