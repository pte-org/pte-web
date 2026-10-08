import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { ScoreTemplateListView } from "@/features/scoretemplate/components";

export default function ExamTemplatePage() {
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <ScoreTemplateListView />
    </RequireAuth>
  );
}
