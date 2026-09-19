"use client";

import { useState, type ReactElement } from "react";
import { ApiError, type QuestionTypeResponse } from "@pte/api-client";
import { Alert, Badge, Button, PageHeader } from "@pte/ui";
import { useDeleteQuestionType, useQuestionTypes, useSupportedQuestionTypes } from "../api";
import { QUESTION_TYPE_REQUIREMENT_LABELS, QUESTION_TYPE_TEXT } from "../constants";
import { QuestionTypeEditorModal } from "./QuestionTypeEditorModal";

const HEADER_CLASS =
  "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap";
const CELL_CLASS = "px-3 py-3 text-sm text-gray-700 align-middle";

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;

export const QuestionTypeView = (): ReactElement => {
  const { data: questionTypes = [], isLoading, isError } = useQuestionTypes(false);
  const { data: supportedTypes = [], isError: supportedTypesError } = useSupportedQuestionTypes();
  const deleteMutation = useDeleteQuestionType();
  const [mode, setMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<QuestionTypeResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const beginCreate = (): void => {
    setMessage(null);
    setEditing(null);
    setMode("create");
  };

  const beginEdit = (type: QuestionTypeResponse): void => {
    setMessage(null);
    setEditing(type);
    setMode("edit");
  };

  const closeEditor = (): void => {
    setMode(null);
    setEditing(null);
  };

  const remove = async (type: QuestionTypeResponse): Promise<void> => {
    if (!window.confirm(QUESTION_TYPE_TEXT.DELETE_CONFIRM)) return;
    setMessage(null);
    try {
      await deleteMutation.mutateAsync({ publicId: type.publicId });
      setMessage(QUESTION_TYPE_TEXT.DELETE_SUCCESS);
    } catch {
      // The mutation error is rendered below with the API's message.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={QUESTION_TYPE_TEXT.TITLE}
        subtitle={QUESTION_TYPE_TEXT.SUBTITLE}
        actions={
          <Button variant="primary" onClick={beginCreate}>
            + {QUESTION_TYPE_TEXT.CREATE}
          </Button>
        }
      />

      {(isError || supportedTypesError) && (
        <Alert tone="error">{QUESTION_TYPE_TEXT.LOAD_ERROR}</Alert>
      )}
      {deleteMutation.isError && (
        <Alert tone="error">
          {errorMessage(deleteMutation.error, QUESTION_TYPE_TEXT.DELETE_ERROR)}
        </Alert>
      )}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="overflow-hidden rounded-lg bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_ORDER}</th>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_QUESTION_TYPE}</th>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_SECTION}</th>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_REQUIREMENTS}</th>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_SCORED}</th>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_STATUS}</th>
                <th className={HEADER_CLASS}>{QUESTION_TYPE_TEXT.TABLE_ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
              {questionTypes.map((type) => (
                <tr key={type.publicId} className="border-t border-gray-100 hover:bg-slate-50/70">
                  <td className={CELL_CLASS}>{type.displayOrder}</td>
                  <td className={CELL_CLASS}>
                    <p className="font-medium text-gray-900">{type.displayName}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {type.code} {QUESTION_TYPE_TEXT.SEPARATOR} {type.shortName}
                    </p>
                  </td>
                  <td className={CELL_CLASS}>{type.section}</td>
                  <td className={CELL_CLASS}>
                    <div className="flex max-w-md flex-wrap gap-1">
                      {QUESTION_TYPE_REQUIREMENT_LABELS.filter(([key]) => type[key]).map(
                        ([, label]) => (
                          <Badge key={label} variant="info">
                            {label}
                          </Badge>
                        ),
                      )}
                    </div>
                  </td>
                  <td className={CELL_CLASS}>
                    {type.scored ? QUESTION_TYPE_TEXT.YES : QUESTION_TYPE_TEXT.NO}
                  </td>
                  <td className={CELL_CLASS}>
                    <Badge variant={type.active ? "success" : "neutral"}>
                      {type.active ? QUESTION_TYPE_TEXT.ACTIVE : QUESTION_TYPE_TEXT.INACTIVE}
                    </Badge>
                  </td>
                  <td className={`${CELL_CLASS} whitespace-nowrap`}>
                    <Button variant="ghost" size="sm" onClick={() => beginEdit(type)}>
                      {QUESTION_TYPE_TEXT.EDIT}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="ml-2"
                      isLoading={
                        deleteMutation.isPending &&
                        deleteMutation.variables?.publicId === type.publicId
                      }
                      onClick={() => void remove(type)}
                    >
                      {QUESTION_TYPE_TEXT.DELETE}
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && questionTypes.length === 0 && (
                <tr>
                  <td className={`${CELL_CLASS} py-8 text-center text-gray-500`} colSpan={7}>
                    {QUESTION_TYPE_TEXT.EMPTY_LIST}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="p-6 text-sm text-gray-500">{QUESTION_TYPE_TEXT.LOADING}</div>}
      </div>

      {mode && (
        <QuestionTypeEditorModal
          key={`${mode}-${editing?.publicId ?? "new"}`}
          mode={mode}
          editing={editing}
          questionTypes={questionTypes}
          supportedTypes={supportedTypes}
          onClose={closeEditor}
          onSuccess={(successMessage) => {
            setMessage(successMessage);
            closeEditor();
          }}
        />
      )}
    </div>
  );
};
