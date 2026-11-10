"use client";

import { useState, type ReactElement } from "react";
import { Button, ErrorState, LoadingState, Modal, Textarea, useToast } from "@pte/ui";
import { useIncidentDetail, useUpdateIncidentStatusMutation } from "../api";
import { PROCTOR_INCIDENT_DETAIL_TEXT as D } from "../constants";
import { INCIDENT_POPUP_TEXT as T } from "../incidentPresentation";
import { IncidentDetailContent } from "./IncidentDetailContent";
import { IncidentHistorySection } from "./IncidentHistorySection";

interface IncidentDetailModalProps {
  sessionPublicId: string;
  incidentPublicId: string;
  onClose: () => void;
}

export function IncidentDetailModal({
  sessionPublicId,
  incidentPublicId,
  onClose,
}: IncidentDetailModalProps): ReactElement {
  const query = useIncidentDetail(sessionPublicId, incidentPublicId);
  const mutation = useUpdateIncidentStatusMutation(sessionPublicId, incidentPublicId);
  const { showToast } = useToast();
  const [note, setNote] = useState("");
  const incident = query.data;
  // The API allows Proctors to add notes only while NEW or IN_PROGRESS.
  const canAddNote = incident?.status === "NEW" || incident?.status === "IN_PROGRESS";
  const save = async (): Promise<void> => {
    if (!incident || !canAddNote || !note.trim()) return;
    try {
      await mutation.mutateAsync({ status: incident.status, notes: note.trim() });
      setNote("");
      showToast(T.SAVED, { tone: "success" });
    } catch (error) {
      showToast(error instanceof Error ? error.message : D.ACTION_FAILED_DEFAULT, {
        tone: "error",
      });
    }
  };
  return (
    <Modal
      open
      title={T.TITLE}
      size="xl"
      onClose={onClose}
      isDismissDisabled={mutation.isPending}
      footer={
        canAddNote ? (
          <Button onClick={() => void save()} disabled={mutation.isPending || !note.trim()}>
            {mutation.isPending ? T.SAVING : T.SAVE}
          </Button>
        ) : undefined
      }
    >
      {query.isLoading ? (
        <LoadingState variant="rows" label={D.LOADING} />
      ) : !incident ? (
        <ErrorState
          title={D.ERROR_TITLE}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {D.RETRY_BTN}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <IncidentDetailContent incident={incident} />
          <IncidentHistorySection
            sessionPublicId={sessionPublicId}
            incidentPublicId={incidentPublicId}
          />
          {canAddNote && (
            <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
              <Textarea
                label={T.NOTE}
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-xs text-[var(--ink-muted)]">{T.NOTE_HINT}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
