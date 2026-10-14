import type { ReactElement } from "react";
import { StaffDetailView } from "@/features/examStaff/detail";

interface StaffDetailPageProps { params: Promise<{ staffPublicId: string }> }

const StaffDetailPage = async ({ params }: StaffDetailPageProps): Promise<ReactElement> => {
  const { staffPublicId } = await params;
  return <StaffDetailView key={staffPublicId} staffPublicId={staffPublicId} />;
};

export default StaffDetailPage;
