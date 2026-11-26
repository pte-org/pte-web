import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { BatchDetailView } from "@/features/batchgeneration/components";

interface AiBatchPageProps { params: Promise<{ "batch-id": string }> }

const AiBatchPage = async ({ params }: AiBatchPageProps): Promise<ReactElement> => {
  const { "batch-id": batchId } = await params;
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <BatchDetailView batchId={batchId} />
    </RequireAuth>
  );
};
export default AiBatchPage;
