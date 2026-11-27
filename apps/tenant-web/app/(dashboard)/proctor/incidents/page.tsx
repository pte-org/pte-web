import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";

export const metadata: Metadata = {
  title: "Incidents | Proctor",
};

export default function ProctorIncidentsPickerPage(): ReactElement {
  return <AssignedSessionPicker mode="incidents" />;
}
