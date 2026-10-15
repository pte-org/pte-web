import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";
import { PROCTOR_PICKER_TEXT } from "@/features/proctor/constants";

export const metadata: Metadata = {
  title: PROCTOR_PICKER_TEXT.ATTENDANCE.PAGE_TITLE,
};

export default function ProctorAttendancePickerPage(): ReactElement {
  return <AssignedSessionPicker mode="attendance" />;
}
