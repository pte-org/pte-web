import { ScoreTemplateEditorView } from "@/features/scoretemplate/components";

interface ExamTemplateEditPageProps {
  params: Promise<{ publicId: string }>;
}

export default async function ExamTemplateEditPage({ params }: ExamTemplateEditPageProps) {
  const { publicId } = await params;

  return <ScoreTemplateEditorView publicId={publicId} />;
}
