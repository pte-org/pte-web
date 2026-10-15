"use client";

import type { ReactElement } from "react";
import type { ExaminerGuidelinesResponse } from "@pte/api-client";
import { Button, EmptyState, LoadingState, Modal } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T, EXAMINER_GUIDELINES_DIALOG_TEXT as G } from "../constants";

interface ExaminerGuidelinesDialogProps {
  open: boolean;
  guidelines?: ExaminerGuidelinesResponse | null;
  isLoading: boolean;
  onClose: () => void;
}

export function ExaminerGuidelinesDialog({
  open,
  guidelines,
  isLoading,
  onClose,
}: ExaminerGuidelinesDialogProps): ReactElement {
  return (
    <Modal open={open} onClose={onClose} title={T.GUIDELINES_TITLE} size="lg">
      <div className="space-y-4 p-4 text-sm text-slate-700">
        {isLoading ? (
          <LoadingState variant="rows" rows={2} label={G.LOADING} />
        ) : guidelines ? (
          <>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <h4 className="font-semibold text-slate-900 mb-1">{G.POLICY_TITLE}</h4>
              <p className="text-xs text-slate-600">
                {G.SCALE_PREFIX}{guidelines.scaleMin} – {guidelines.scaleMax}
              </p>
              <p className="mt-1 text-xs text-slate-600">{guidelines.limitation}</p>
            </div>

            {guidelines.templates && guidelines.templates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">{G.TASK_CRITERIA_TITLE}</h4>
                {guidelines.templates.map((tpl) => (
                  <div key={tpl.scoreTemplatePublicId} className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-mono text-slate-500 mb-2">
                      {G.TEMPLATE_PREFIX}{tpl.scoreTemplatePublicId.slice(0, 8)}
                    </p>
                    <div className="space-y-1">
                      {Array.isArray(tpl.items) && tpl.items.length > 0 ? (
                        tpl.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                            {typeof item === "object" && item !== null ? (
                              <div className="flex flex-col gap-0.5">
                                {Object.entries(item).map(([k, v]) => (
                                  <div key={k} className="flex gap-2">
                                    <span className="font-medium text-slate-700 capitalize">{k}:</span>
                                    <span className="text-slate-600">{String(v)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span>{String(item)}</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">{G.STANDARD_RUBRIC_FALLBACK}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState title={G.EMPTY_TITLE} />
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {G.CLOSE}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
