import { RequireAuth } from "@/features/auth/components";
import { ACADEMIC_ROLES } from "@/features/auth/constants";
import { QuestionDetailView, QuestionHistorySection } from "@/features/questionbank/components";

interface QuestionDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { publicId } = await params;

  return (
    <RequireAuth allowedRoles={ACADEMIC_ROLES}>
      <div className="flex flex-col gap-6">
        <QuestionDetailView publicId={publicId} />
        <QuestionHistorySection publicId={publicId} />
      </div>
    </RequireAuth>
  );
}
