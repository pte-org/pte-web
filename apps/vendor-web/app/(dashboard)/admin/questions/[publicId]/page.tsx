import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { QuestionDetailView } from "@/features/questionbank/components";

interface QuestionDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <QuestionDetailView publicId={publicId} />
    </RequireAuth>
  );
}
