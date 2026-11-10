"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { Button } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { EXAM_STUDIO_TEXT, NEW_QUESTION_ROUTE } from "../constants";

export const StudioDrawerFooter = (): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const router = useRouter();

  return <Button onClick={() => router.push(NEW_QUESTION_ROUTE)}>+ {text.COMPOSE_QUESTION}</Button>;
};
