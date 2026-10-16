"use client";

import type { ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { ExaminerOverviewView } from "./ExaminerOverviewView";
import { ExaminerQueueView } from "./ExaminerQueueView";

export const ExaminerWorkView = (): ReactElement => {
  const searchParams = useSearchParams();
  const status = searchParams?.get("status");

  if (!status) {
    return <ExaminerOverviewView />;
  }

  return <ExaminerQueueView />;
};
