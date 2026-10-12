"use client";

import type { ReactElement } from "react";
import type { ExaminerGuidelinesResponse } from "@pte/api-client";
import { Button, Modal } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "../constants";

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
          <p className="text-slate-500">Loading scoring guidelines…</p>
        ) : guidelines ? (
          <>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <h4 className="font-semibold text-slate-900 mb-1">Scoring Scale & Policy</h4>
              <p className="text-xs text-slate-600">
                Scale: {guidelines.scaleMin} – {guidelines.scaleMax}
              </p>
              <p className="mt-1 text-xs text-slate-600">{guidelines.limitation}</p>
            </div>

            {guidelines.templates && guidelines.templates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Task Criteria</h4>
                {guidelines.templates.map((tpl) => (
                  <div key={tpl.scoreTemplatePublicId} className="rounded-md border border-slate-200 p-3">
                    <p className="text-xs font-mono text-slate-500 mb-2">
                      Template: {tpl.scoreTemplatePublicId.slice(0, 8)}
                    </p>
                    <div className="space-y-1">
                      {Array.isArray(tpl.items) && tpl.items.length > 0 ? (
                        tpl.items.map((item, idx) => (
                          <div key={idx} className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-100">
                            {JSON.stringify(item)}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">Standard scalar 0–100 rubric applies.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500">No specific guidelines configured for this session.</p>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
