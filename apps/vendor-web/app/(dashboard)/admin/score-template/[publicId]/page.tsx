import { ScoreTemplateDetailView } from "@/features/scoretemplate/components";

interface ScoreTemplateDetailPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ScoreTemplateDetailPage({ params }: ScoreTemplateDetailPageProps) {
  const { publicId } = await params;

  return <ScoreTemplateDetailView publicId={publicId} />;
}
