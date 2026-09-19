"use client";

import { useState, type ChangeEvent, type ReactElement } from "react";
import { Alert, Badge, Button, Input, Modal, PageHeader } from "@pte/ui";
import {
  ApiError,
  type QuestionTypeResponse,
  type UpdateQuestionTypeRequest,
} from "@pte/api-client";
import {
  useImportQuestionTypesFromScoreTemplate,
  useQuestionTypes,
  useUpdateQuestionType,
} from "../api";
import { QUESTION_TYPE_REQUIREMENT_LABELS, QUESTION_TYPE_TEXT } from "../constants";
import {
  parseScoreTemplateExport,
  toQuestionTypeImportItems,
  type ScoreTemplateImportDocument,
} from "@/features/scoretemplate/serialization";

const HEADER_CLASS =
  "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap";
const CELL_CLASS = "px-3 py-3 text-sm text-gray-700 align-middle";

type QuestionTypeDraft = UpdateQuestionTypeRequest;

const toDraft = (type: QuestionTypeResponse): QuestionTypeDraft => ({
  displayName: type.displayName,
  shortName: type.shortName,
  displayOrder: type.displayOrder,
  active: type.active,
  requiresAudioPrompt: type.requiresAudioPrompt,
  requiresImagePrompt: type.requiresImagePrompt,
  requiresPromptText: type.requiresPromptText,
  requiresOptions: type.requiresOptions,
  requiresCorrectAnswer: type.requiresCorrectAnswer,
  requiresWordCount: type.requiresWordCount,
  requiresSingleCorrectOption: type.requiresSingleCorrectOption,
  usesOptionOrderAsCorrectPosition: type.usesOptionOrderAsCorrectPosition,
});

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof ApiError ? error.message : fallback;

export const QuestionTypeView = (): ReactElement => {
  const { data: questionTypes = [], isLoading, isError } = useQuestionTypes(false);
  const updateMutation = useUpdateQuestionType();
  const importMutation = useImportQuestionTypesFromScoreTemplate();
  const [editing, setEditing] = useState<QuestionTypeResponse | null>(null);
  const [draft, setDraft] = useState<QuestionTypeDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [importDocument, setImportDocument] = useState<ScoreTemplateImportDocument | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const beginEdit = (type: QuestionTypeResponse): void => {
    setMessage(null);
    setEditing(type);
    setDraft(toDraft(type));
  };

  const closeEditor = (): void => {
    if (updateMutation.isPending) return;
    setEditing(null);
    setDraft(null);
  };

  const save = async (): Promise<void> => {
    if (!editing || !draft) return;
    setMessage(null);
    try {
      await updateMutation.mutateAsync({ publicId: editing.publicId, payload: draft });
      setMessage(QUESTION_TYPE_TEXT.UPDATE_SUCCESS);
      closeEditor();
    } catch {
      // The mutation error is rendered below with the API's message.
    }
  };

  const updateDraft = <K extends keyof QuestionTypeDraft>(
    key: K,
    value: QuestionTypeDraft[K],
  ): void => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setImportError(null);
    setImportDocument(null);
    setImportFileName(null);
    if (!file) return;

    try {
      const document = parseScoreTemplateExport(JSON.parse(await file.text()));
      setImportDocument(document);
      setImportFileName(file.name);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : QUESTION_TYPE_TEXT.IMPORT_ERROR);
    }
  };

  const importQuestionTypes = async (): Promise<void> => {
    if (!importDocument) return;
    setImportError(null);
    try {
      await importMutation.mutateAsync({
        items: toQuestionTypeImportItems(importDocument),
      });
      setMessage(QUESTION_TYPE_TEXT.IMPORT_SUCCESS);
      setImportDocument(null);
      setImportFileName(null);
    } catch {
      // The mutation error is rendered below with the API's message.
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={QUESTION_TYPE_TEXT.TITLE} subtitle={QUESTION_TYPE_TEXT.SUBTITLE} />

      {isError && <Alert tone="error">{QUESTION_TYPE_TEXT.LOAD_ERROR}</Alert>}
      {updateMutation.isError && (
        <Alert tone="error">
          {errorMessage(updateMutation.error, QUESTION_TYPE_TEXT.SAVE_ERROR)}
        </Alert>
      )}
      {importMutation.isError && (
        <Alert tone="error">
          {errorMessage(importMutation.error, QUESTION_TYPE_TEXT.IMPORT_ERROR)}
        </Alert>
      )}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-5 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {QUESTION_TYPE_TEXT.IMPORT_TITLE}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              {QUESTION_TYPE_TEXT.IMPORT_SUBTITLE}
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-inset ring-blue-200 hover:bg-blue-50">
            {QUESTION_TYPE_TEXT.CHOOSE_FILE}
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(event) => void handleImportFile(event)}
            />
          </label>
        </div>
        {importFileName && importDocument && (
          <div className="mt-4 flex flex-col gap-3 rounded-md bg-white p-3 text-sm text-gray-700 md:flex-row md:items-center md:justify-between">
            <span>
              <span className="font-medium">{importFileName}</span>
              <span className="ml-2 text-gray-500">
                {importDocument.items.length} task types from {importDocument.name}
              </span>
            </span>
            <Button
              variant="primary"
              size="sm"
              isLoading={importMutation.isPending}
              onClick={() => void importQuestionTypes()}
            >
              {QUESTION_TYPE_TEXT.IMPORT}
            </Button>
          </div>
        )}
        {importError && <p className="mt-3 text-sm text-rose-700">{importError}</p>}
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className={HEADER_CLASS}>#</th>
                <th className={HEADER_CLASS}>Question type</th>
                <th className={HEADER_CLASS}>Section</th>
                <th className={HEADER_CLASS}>Requirements</th>
                <th className={HEADER_CLASS}>Scored</th>
                <th className={HEADER_CLASS}>Status</th>
                <th className={HEADER_CLASS}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questionTypes.map((type) => (
                <tr key={type.publicId} className="border-t border-gray-100 hover:bg-slate-50/70">
                  <td className={CELL_CLASS}>{type.displayOrder}</td>
                  <td className={CELL_CLASS}>
                    <p className="font-medium text-gray-900">{type.displayName}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {type.code} · {type.shortName}
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
                  <td className={CELL_CLASS}>{type.scored ? "Yes" : "No"}</td>
                  <td className={CELL_CLASS}>
                    <Badge variant={type.active ? "success" : "neutral"}>
                      {type.active ? QUESTION_TYPE_TEXT.ACTIVE : QUESTION_TYPE_TEXT.INACTIVE}
                    </Badge>
                  </td>
                  <td className={CELL_CLASS}>
                    <Button variant="ghost" size="sm" onClick={() => beginEdit(type)}>
                      {QUESTION_TYPE_TEXT.EDIT}
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && questionTypes.length === 0 && (
                <tr>
                  <td className={`${CELL_CLASS} py-8 text-center text-gray-500`} colSpan={7}>
                    No question types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && <div className="p-6 text-sm text-gray-500">Loading question types...</div>}
      </div>

      <Modal
        open={editing !== null && draft !== null}
        onClose={closeEditor}
        title={editing ? `${QUESTION_TYPE_TEXT.EDIT_TITLE}: ${editing.code}` : undefined}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closeEditor} disabled={updateMutation.isPending}>
              {QUESTION_TYPE_TEXT.CANCEL}
            </Button>
            <Button
              variant="primary"
              onClick={() => void save()}
              isLoading={updateMutation.isPending}
            >
              {QUESTION_TYPE_TEXT.SAVE}
            </Button>
          </>
        }
      >
        {editing && draft && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="question-type-display-name"
              label="Display name"
              value={draft.displayName}
              onChange={(event) => updateDraft("displayName", event.target.value)}
            />
            <Input
              id="question-type-short-name"
              label="Short name"
              value={draft.shortName}
              onChange={(event) => updateDraft("shortName", event.target.value)}
            />
            <Input
              id="question-type-display-order"
              label="Display order"
              type="number"
              min={0}
              value={draft.displayOrder}
              onChange={(event) => updateDraft("displayOrder", Number(event.target.value) || 0)}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => updateDraft("active", event.target.checked)}
                />
                Available for new questions
              </label>
            </div>
            <div className="rounded-md bg-slate-50 p-3 text-sm text-gray-600 md:col-span-2">
              <span className="font-medium text-gray-900">{editing.section}</span>
              {editing.scored ? " · contributes to scoring" : " · not scored"}
              <span className="ml-2 font-mono text-xs">{editing.code}</span>
            </div>
            <fieldset className="grid gap-3 rounded-md border border-gray-200 p-4 md:col-span-2 md:grid-cols-2">
              <legend className="px-1 text-sm font-medium text-gray-700">
                Authoring requirements
              </legend>
              {QUESTION_TYPE_REQUIREMENT_LABELS.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={draft[key]}
                    onChange={(event) => updateDraft(key, event.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </div>
        )}
      </Modal>
    </div>
  );
};
