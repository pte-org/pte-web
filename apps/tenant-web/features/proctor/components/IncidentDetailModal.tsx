"use client";

import { useState, type ReactElement } from "react";
import { Button, ErrorState, LoadingState, Modal, Textarea, useToast } from "@pte/ui";
import { useIncidentDetail, useUpdateIncidentStatusMutation } from "../api";
import { useIncidentText } from "../hooks/useIncidentText";
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
  const text = useIncidentText();
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
      showToast(text.noteSaved, { tone: "success" });
    } catch (error) {
      showToast(error instanceof Error ? error.message : text.detailActionFailed, {
        tone: "error",
      });
    }
  };
  return (
    <Modal
      open
      title={text.detailTitle}
      size="xl"
      onClose={onClose}
      isDismissDisabled={mutation.isPending}
      footer={
        canAddNote ? (
          <Button onClick={() => void save()} disabled={mutation.isPending || !note.trim()}>
            {mutation.isPending ? text.noteSaving : text.noteSave}
          </Button>
        ) : undefined
      }
    >
      {query.isLoading ? (
        <LoadingState variant="rows" label={text.detailLoading} />
      ) : !incident ? (
        <ErrorState
          title={text.detailErrorTitle}
          action={
            <Button variant="secondary" onClick={() => void query.refetch()}>
              {text.retry}
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
                label={text.noteLabel}
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-xs text-[var(--ink-muted)]">{text.noteHint}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
