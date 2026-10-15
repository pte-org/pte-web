import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";
import { PROCTOR_PICKER_TEXT } from "@/features/proctor/constants";

export const metadata: Metadata = {
  title: PROCTOR_PICKER_TEXT.INCIDENTS.PAGE_TITLE,
};

export default function ProctorIncidentsPickerPage(): ReactElement {
  return <AssignedSessionPicker mode="incidents" />;
}
