import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { QuestionBankView } from "@/features/questionbank/components";

export default function QuestionsPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <QuestionBankView />
    </RequireAuth>
  );
}
