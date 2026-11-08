import type { ReactElement } from "react";
import { RequireAuth } from "@/features/auth/components";
import { PLATFORM_ADMIN_ONLY } from "@/features/auth/constants";
import { LiveGenerationView } from "@/features/questiongeneration/components";

interface AiGenerationLivePageProps { params: Promise<{ jobId: string }> }
const AiGenerationLivePage = async ({ params }: AiGenerationLivePageProps): Promise<ReactElement> => {
  const { jobId } = await params;
  return <RequireAuth allowedRoles={PLATFORM_ADMIN_ONLY}><LiveGenerationView jobId={jobId} /></RequireAuth>;
};
export default AiGenerationLivePage;
