import { ScoreTemplateDetailView } from "@/features/scoretemplate/components";

interface ExamTemplateDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ExamTemplateDetailPage({
  params,
}: ExamTemplateDetailPageProps) {
  const { publicId } = await params;

  return <ScoreTemplateDetailView publicId={publicId} />;
}
