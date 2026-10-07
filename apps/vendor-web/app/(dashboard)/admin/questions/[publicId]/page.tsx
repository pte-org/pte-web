import { QuestionDetailView } from "@/features/questionbank/components";

interface QuestionDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { publicId } = await params;

  return <QuestionDetailView publicId={publicId} />;
}
