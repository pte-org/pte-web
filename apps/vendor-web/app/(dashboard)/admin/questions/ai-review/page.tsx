import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { QuestionReviewPage } from "@/features/questiongeneration/components";

export default function AIReviewPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <QuestionReviewPage />
    </RequireAuth>
  );
}
