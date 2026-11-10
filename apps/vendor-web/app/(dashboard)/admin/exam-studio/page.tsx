import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { ExamStudioView } from "@/features/examstudio/components";

export default function ExamStudioPage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <ExamStudioView />
    </RequireAuth>
  );
}
