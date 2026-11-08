"use client";
import type { ReactElement } from "react";
import { ErrorState, LoadingState, useLocale } from "@pte/ui";
import { useRubricTaskTypes } from "../api";
import { useRubricVersion } from "../versionApi";
import { RUBRIC_EDIT_TEXT } from "../versionConstants";
import { RubricVersionEditor } from "./RubricVersionEditor";

interface RubricVersionEditViewProps { id: string }
export const RubricVersionEditView = ({ id }: RubricVersionEditViewProps): ReactElement => {
  const { locale } = useLocale();
  const T = RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"];
  const version = useRubricVersion(id);
  const rubrics = useRubricTaskTypes(id);
  if (version.isLoading || rubrics.isLoading) return <LoadingState rows={5} />;
  if (!version.data || !rubrics.data || version.isError || rubrics.isError) return <ErrorState title={T.error} />;
  return <RubricVersionEditor key={id} version={version.data} rubrics={rubrics.data} />;
};
