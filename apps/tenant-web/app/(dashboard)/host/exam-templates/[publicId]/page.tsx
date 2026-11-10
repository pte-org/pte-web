"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { LoadingState } from "@pte/ui";
import { HostTemplateEditorView } from "@/features/hostTemplates/components";

export default function HostExamTemplateEditorPage() {
  const { publicId } = useParams<{ publicId: string }>();
  return (
    <Suspense fallback={<LoadingState rows={4} />}>
      <HostTemplateEditorView publicId={publicId} />
    </Suspense>
  );
}
