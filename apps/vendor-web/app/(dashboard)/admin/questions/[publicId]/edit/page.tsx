import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { EditQuestionView } from "@/features/questionbank/components";

interface EditQuestionPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { publicId } = await params;
  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <EditQuestionView publicId={publicId} />
    </RequireAuth>
  );
}
