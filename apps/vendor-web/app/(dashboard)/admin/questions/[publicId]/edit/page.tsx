import { EditQuestionView } from "@/features/questionbank/components";

interface EditQuestionPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { publicId } = await params;
  return <EditQuestionView publicId={publicId} />;
}
