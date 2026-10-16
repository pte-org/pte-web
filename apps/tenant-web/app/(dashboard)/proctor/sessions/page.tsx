"use client";

import { Suspense, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { AssignedSessionsView } from "@/features/proctor/components/AssignedSessionsView";
import { ProctorOverviewView } from "@/features/proctor/components/ProctorOverviewView";
import { Skeleton } from "@pte/ui";

function ProctorSessionsContent(): ReactElement {
  const searchParams = useSearchParams();
  const hasScope = searchParams.has("scope");

  if (!hasScope) {
    return <ProctorOverviewView />;
  }
  return <AssignedSessionsView />;
}

export default function ProctorSessionsPage(): ReactElement {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full" /></div>}>
      <ProctorSessionsContent />
    </Suspense>
  );
}
