import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AssignedSessionPicker } from "@/features/proctor/components/AssignedSessionPicker";

export const metadata: Metadata = {
  title: "Sự cố phòng thi | Giám thị",
};

export default function ProctorIncidentsPickerPage(): ReactElement {
  return (
    <AssignedSessionPicker
      mode="incidents"
      title="Sự cố phòng thi"
      subtitle="Chọn ca thi bạn được phân công giám thị để quản lý, báo cáo và theo dõi sự cố."
    />
  );
}
