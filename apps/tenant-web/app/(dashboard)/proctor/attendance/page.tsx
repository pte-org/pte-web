import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";

export const metadata: Metadata = {
  title: "Attendance | Proctor",
};

export default function ProctorAttendancePickerPage(): ReactElement {
  return <AssignedSessionPicker mode="attendance" />;
}
