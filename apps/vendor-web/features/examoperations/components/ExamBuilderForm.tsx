"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Input, LoadingState, PageHeader } from "@pte/ui";
import type { CreateBlueprintRequest, ExamBlueprintResponse, ExamSnapshotResponse } from "@pte/api-client";
import { useSessionManager } from "@pte/ui";
import { useQuestions } from "@/features/questionbank/api";
import type { Question } from "@/features/questionbank/types";
import { useActiveScoreTemplate } from "@/features/scoretemplate/api";
import {
  useApproveBlueprint,
  useBlueprint,
  useBlueprints,
  useCreateBlueprint,
  useRejectBlueprint,
  useSubmitBlueprintApproval,
  useUpdateBlueprint,
} from "../api";
import { BLUEPRINT_STATUS_LABELS, SECTION_LABELS } from "../constants";

interface ExamBuilderFormProps {
  publicId?: string;
}

const SECTION_FROM_SKILL: Record<Question["skill"], string> = {
  speaking: "SPEAKING",
  writing: "WRITING",
  reading: "READING",
  listening: "LISTENING",
};

const SELECT_CLASS =
  "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none shadow-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export const ExamBuilderForm = ({ publicId }: ExamBuilderFormProps): ReactElement => {
  const { data: blueprint, isLoading: isBlueprintLoading, isError: isBlueprintError } = useBlueprint(publicId);

  if (publicId && isBlueprintLoading) return <LoadingState rows={6} />;
  if (publicId && isBlueprintError) return <Alert tone="error">Could not load the exam builder data.</Alert>;
  if (publicId && !blueprint) return <LoadingState rows={6} />;

  return <ExamBuilderFormContent key={blueprint?.publicId ?? "new"} publicId={publicId} blueprint={blueprint} />;
};

interface ExamBuilderFormContentProps extends ExamBuilderFormProps {
  blueprint?: ExamBlueprintResponse;
}

const ExamBuilderFormContent = ({ publicId, blueprint }: ExamBuilderFormContentProps): ReactElement => {
  const router = useRouter();
  const { data: blueprints } = useBlueprints();
  const { data: questions, isLoading: isQuestionsLoading, isError: isQuestionsError } = useQuestions();
  const { data: template, isLoading: isTemplateLoading, isError: isTemplateError } = useActiveScoreTemplate();
  const createMutation = useCreateBlueprint();
  const updateMutation = useUpdateBlueprint();
  const submitMutation = useSubmitBlueprintApproval();
  const approveMutation = useApproveBlueprint();
  const rejectMutation = useRejectBlueprint();
  const { hasRole } = useSessionManager();
  const isAdmin = hasRole("PLATFORM_ADMIN");

  const [name, setName] = useState(() => blueprint?.name ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    blueprint
      ? blueprint.items
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((item) => item.questionPublicId)
      : [],
  );
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [publishedSnapshot, setPublishedSnapshot] = useState<ExamSnapshotResponse | null>(null);
  const [localStatus, setLocalStatus] = useState(() => blueprint?.status ?? "DRAFT");
  const [preserveOrder, setPreserveOrder] = useState(() => Boolean(blueprint));

  const taskOrder = useMemo(() => {
    const order = new Map<string, number>();
    template?.items
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
      .forEach((item, index) => order.set(item.taskType, index));
    return order;
  }, [template]);

  const selectedQuestions = useMemo(() => {
    const byId = new Map((questions ?? []).map((question) => [question.id, question]));
    const selected = selectedIds
      .map((id, selectionIndex) => ({ question: byId.get(id), selectionIndex }))
      .filter((item): item is { question: Question; selectionIndex: number } => Boolean(item.question));
    if (preserveOrder) return selected;
    return selected.sort((a, b) => {
        const taskDiff = (taskOrder.get(a.question.taskType) ?? Number.MAX_SAFE_INTEGER)
          - (taskOrder.get(b.question.taskType) ?? Number.MAX_SAFE_INTEGER);
        return taskDiff || a.selectionIndex - b.selectionIndex;
      });
  }, [preserveOrder, questions, selectedIds, taskOrder]);

  const filteredQuestions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (questions ?? [])
      .filter((question) => question.status === "published")
      .filter((question) => !sectionFilter || SECTION_FROM_SKILL[question.skill] === sectionFilter)
      .filter((question) => !taskTypeFilter || question.taskType === taskTypeFilter)
      .filter((question) => !normalizedSearch || `${question.content} ${question.taskType}`.toLowerCase().includes(normalizedSearch));
  }, [questions, search, sectionFilter, taskTypeFilter]);

  const taskOptions = useMemo(
    () => Array.from(new Set((questions ?? []).filter((question) => question.status === "published").map((question) => question.taskType))).sort(),
    [questions],
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isBusy = isSaving || submitMutation.isPending || approveMutation.isPending || rejectMutation.isPending;
  const currentStatus = localStatus;
  const error = createMutation.isError || updateMutation.isError || submitMutation.isError || approveMutation.isError || rejectMutation.isError;

  const toggleQuestion = (questionId: string): void => {
    setSelectedIds((current) => current.includes(questionId)
      ? current.filter((id) => id !== questionId)
      : [...current, questionId]);
  };

  const moveSelected = (questionId: string, direction: -1 | 1): void => {
    const displayedIds = selectedQuestions.map(({ question }) => question.id);
    const index = displayedIds.indexOf(questionId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= displayedIds.length) return;
    const next = [...displayedIds];
    [next[index], next[target]] = [next[target], next[index]];
    setSelectedIds(next);
    setPreserveOrder(true);
  };

  const payload = (): CreateBlueprintRequest => ({
    name: name.trim(),
    version: blueprint?.version,
    preserveOrder,
    items: selectedIds.map((questionPublicId, orderIndex) => {
      const question = questions?.find((item) => item.id === questionPublicId);
      return {
        questionPublicId,
        section: question ? SECTION_FROM_SKILL[question.skill] : undefined,
        orderIndex,
      };
    }),
  });

  const saveDraft = (event?: FormEvent): void => {
    event?.preventDefault();
    setMessage(null);
    if (!name.trim() || selectedIds.length === 0) {
      setMessage("Enter an exam name and select at least one approved question.");
      return;
    }
    const request = payload();
    if (publicId) {
      updateMutation.mutate({ publicId, payload: request }, {
        onSuccess: (saved) => {
          setLocalStatus(saved.status);
          setMessage("Exam draft saved.");
        },
      });
      return;
    }
    createMutation.mutate(request, {
      onSuccess: (created) => router.replace(`/admin/exams/${created.publicId}/edit`),
    });
  };

  const submitApproval = (): void => {
    if (!publicId) return;
    const complianceError = validateTemplateCounts();
    if (complianceError) {
      setMessage(complianceError);
      return;
    }
    setMessage(null);
    submitMutation.mutate(publicId, {
      onSuccess: (submitted) => {
        setLocalStatus(submitted.status);
        setMessage("Exam submitted for admin approval.");
      },
    });
  };

  const approve = (): void => {
    if (!publicId) return;
    approveMutation.mutate(publicId, {
      onSuccess: (snapshot) => {
        setLocalStatus("PUBLISHED");
        setPublishedSnapshot(snapshot);
        setMessage("Exam approved and published as an immutable snapshot.");
      },
    });
  };

  const reject = (): void => {
    if (!publicId) return;
    const reason = window.prompt("Reason for rejecting this exam:");
    if (!reason?.trim()) return;
    rejectMutation.mutate({ publicId, reason: reason.trim() }, {
      onSuccess: (rejected) => {
        setLocalStatus(rejected.status);
        setMessage("Exam returned to draft.");
      },
    });
  };

  const validateTemplateCounts = (): string | null => {
    if (!template) return "No active PTE score template is configured.";
    const selectedByTaskType = new Map<string, number>();
    selectedQuestions.forEach(({ question }) => {
      selectedByTaskType.set(question.taskType, (selectedByTaskType.get(question.taskType) ?? 0) + 1);
    });
    const invalid = template.items.find((item) => {
      const count = selectedByTaskType.get(item.taskType) ?? 0;
      return count < item.minCount || count > item.maxCount;
    });
    return invalid
      ? `${invalid.taskType} requires ${invalid.minCount}-${invalid.maxCount} questions before submission.`
      : null;
  };

  if (isQuestionsLoading || isTemplateLoading) return <LoadingState rows={6} />;
  if (isQuestionsError || isTemplateError) return <Alert tone="error">Could not load the exam builder data.</Alert>;
  if (!template) return <Alert tone="error">No active PTE score template is configured.</Alert>;

  return (
    <form className="space-y-6" onSubmit={saveDraft}>
      <PageHeader
        title={publicId ? "Edit Exam" : "Create Exam"}
        subtitle="Select approved questions. The active PTE template determines the default delivery order."
      />

      {message && <Alert tone="success">{message}</Alert>}
      {error && <Alert tone="error">The exam operation failed. Check the selected questions and try again.</Alert>}
      {blueprint?.rejectionReason && <Alert tone="warning">Admin feedback: {blueprint.rejectionReason}</Alert>}
      {publishedSnapshot && (
        <Alert tone="success" title="Immutable snapshot published">
          Snapshot version {publishedSnapshot.version} · {publishedSnapshot.items.length} items · score template v{publishedSnapshot.scoreTemplateVersion}.
        </Alert>
      )}

      <section className="rounded-lg bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Input label="Exam name" required value={name} onChange={(event) => setName(event.target.value)} />
          {publicId && <Badge variant={currentStatus === "PUBLISHED" ? "success" : currentStatus === "PENDING_APPROVAL" ? "info" : "warning"}>{BLUEPRINT_STATUS_LABELS[currentStatus] ?? currentStatus}</Badge>}
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Input label="Search approved questions" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="flex min-w-44 flex-col gap-1 text-sm text-gray-700">
            <span>Section</span>
            <select className={SELECT_CLASS} value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)}>
              <option value="">All sections</option>
              {Object.entries(SECTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="flex min-w-56 flex-col gap-1 text-sm text-gray-700">
            <span>Task type</span>
            <select className={SELECT_CLASS} value={taskTypeFilter} onChange={(event) => setTaskTypeFilter(event.target.value)}>
              <option value="">All task types</option>
              {taskOptions.map((taskType) => <option key={taskType} value={taskType}>{taskType}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-md border border-gray-200">
            <div className="border-b border-gray-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Approved question bank ({filteredQuestions.length})</div>
            <div className="max-h-[32rem] divide-y divide-gray-100 overflow-y-auto">
              {filteredQuestions.map((question) => (
                <label key={question.id} className="flex cursor-pointer gap-3 px-4 py-3 hover:bg-slate-50">
                  <input type="checkbox" checked={selectedIds.includes(question.id)} onChange={() => toggleQuestion(question.id)} className="mt-1 h-4 w-4" />
                  <span className="min-w-0 text-sm">
                    <span className="block font-medium text-slate-800">{question.content}</span>
                    <span className="text-xs text-slate-500">{question.taskType} · {SECTION_LABELS[SECTION_FROM_SKILL[question.skill]]}</span>
                  </span>
                </label>
              ))}
              {filteredQuestions.length === 0 && <p className="p-4 text-sm text-slate-500">No approved questions match the filters.</p>}
            </div>
          </div>

          <div className="rounded-md border border-gray-200">
            <div className="border-b border-gray-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Exam order ({selectedQuestions.length})</div>
            <div className="max-h-[32rem] divide-y divide-gray-100 overflow-y-auto">
              {selectedQuestions.map(({ question }, displayIndex) => (
                <div key={question.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="w-6 pt-0.5 text-sm font-semibold text-slate-500">{displayIndex + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{question.content}</p>
                    <p className="text-xs text-slate-500">{question.taskType} · {SECTION_LABELS[SECTION_FROM_SKILL[question.skill]]}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" disabled={displayIndex === 0} onClick={() => moveSelected(question.id, -1)} aria-label="Move question up">↑</Button>
                    <Button type="button" variant="ghost" size="sm" disabled={displayIndex === selectedQuestions.length - 1} onClick={() => moveSelected(question.id, 1)} aria-label="Move question down">↓</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => toggleQuestion(question.id)} aria-label="Remove question">×</Button>
                  </div>
                </div>
              ))}
              {selectedQuestions.length === 0 && <p className="p-4 text-sm text-slate-500">Select questions from the bank to build the exam.</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow-card">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Active PTE template order</h3>
        <p className="mb-3 text-xs text-slate-500">
          The template order is used by default. Moving an item enables a custom order for this draft.
        </p>
        <div className="flex flex-wrap gap-2">
          {template.items.slice().sort((a, b) => a.sequence - b.sequence).map((item) => (
            <span key={`${item.taskType}-${item.sequence}`} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {item.sequence}. {item.taskType} ({item.minCount}–{item.maxCount})
            </span>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSaving} disabled={currentStatus !== "DRAFT"}>Save draft</Button>
        {publicId && currentStatus === "DRAFT" && <Button type="button" variant="secondary" isLoading={submitMutation.isPending} disabled={isBusy} onClick={submitApproval}>Submit for approval</Button>}
        {publicId && isAdmin && currentStatus === "PENDING_APPROVAL" && <>
          <Button type="button" variant="secondary" isLoading={approveMutation.isPending} disabled={isBusy} onClick={approve}>Approve & publish</Button>
          <Button type="button" variant="danger" isLoading={rejectMutation.isPending} disabled={isBusy} onClick={reject}>Reject</Button>
        </>}
      </div>

      {!publicId && (blueprints ?? []).length > 0 && (
        <section className="rounded-lg bg-white p-5 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Saved exams</h3>
          <div className="divide-y divide-gray-100">
            {(blueprints ?? []).map((saved) => (
              <div key={saved.publicId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{saved.name}</p>
                  <p className="text-xs text-slate-500">{BLUEPRINT_STATUS_LABELS[saved.status] ?? saved.status} · {saved.items.length} items</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => router.push(`/admin/exams/${saved.publicId}/edit`)}>Open</Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </form>
  );
};
