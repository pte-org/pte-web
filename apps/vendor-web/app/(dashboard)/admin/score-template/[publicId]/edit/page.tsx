import { ScoreTemplateEditorView } from "@/features/scoretemplate/components";

interface ScoreTemplateEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ScoreTemplateEditPage({ params }: ScoreTemplateEditPageProps) {
  const { publicId } = await params;

  return <ScoreTemplateEditorView publicId={publicId} />;
}
