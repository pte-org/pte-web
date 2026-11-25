"use client";

import { useState, type ReactElement } from "react";
import { Button, ErrorState, LoadingState, Modal, Select, Textarea, useToast } from "@pte/ui";
import type { IncidentStatus } from "@pte/api-client";
import { useIncidentDetail, useUpdateIncidentStatusMutation } from "@/features/proctor/api";
import { IncidentDetailContent } from "@/features/proctor/components/IncidentDetailContent";
import { IncidentHistorySection } from "@/features/proctor/components/IncidentHistorySection";
import { useIncidentText } from "@/features/proctor/hooks/useIncidentText";
import { HOST_INCIDENT_TRANSITIONS } from "../constants/incidents";

interface HostIncidentDetailModalProps {
  sessionPublicId: string;
  incidentPublicId: string;
  onClose: () => void;
}

export function HostIncidentDetailModal({
  sessionPublicId,
  incidentPublicId,
  onClose,
}: HostIncidentDetailModalProps): ReactElement {
  const text = useIncidentText();
  const query = useIncidentDetail(sessionPublicId, incidentPublicId);
  const mutation = useUpdateIncidentStatusMutation(sessionPublicId, incidentPublicId);
  const { showToast } = useToast();
  const [target, setTarget] = useState<IncidentStatus | null>(null);
  const [note, setNote] = useState("");
  const incident = query.data;
  const editable = incident && incident.status !== "CLOSED";
  const nextStatus = target ?? incident?.status;
  const allowed = incident ? [incident.status, ...HOST_INCIDENT_TRANSITIONS[incident.status]] : [];
  const save = async (): Promise<void> => {
    if (!editable || !incident || !nextStatus || !allowed.includes(nextStatus) || !note.trim())
      return;
    try {
      await mutation.mutateAsync({
        status: nextStatus,
        notes: note.trim(),
        ...(nextStatus === "RESOLVED" ? { resolutionSummary: note.trim() } : {}),
        ...(nextStatus === "IN_PROGRESS" ? { receiverRole: "HOST_ADMIN" } : {}),
      });
      setTarget(null);
      setNote("");
      showToast(text.hostSaved, { tone: "success" });
    } catch (error) {
      showToast(error instanceof Error ? error.message : text.hostFailed, { tone: "error" });
    }
  };
  return (
    <Modal
      open
      size="full"
      title={text.hostTitle}
      onClose={onClose}
      isDismissDisabled={mutation.isPending}
      footer={
        editable ? (
          <Button
            onClick={() => void save()}
            disabled={
              mutation.isPending || !note.trim() || !nextStatus || !allowed.includes(nextStatus)
            }
          >
            {mutation.isPending ? text.hostSaving : text.hostSave}
          </Button>
        ) : undefined
      }
    >
      {query.isLoading ? (
        <LoadingState variant="rows" />
      ) : !incident ? (
        <ErrorState
          title={text.detailErrorTitle}
          action={<Button onClick={() => void query.refetch()}>{text.retry}</Button>}
        />
      ) : (
        <div className="space-y-6">
          <IncidentDetailContent incident={incident} />
          <IncidentHistorySection
            sessionPublicId={sessionPublicId}
            incidentPublicId={incidentPublicId}
          />
          {editable ? (
            <section className="space-y-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4">
              <h3 className="text-sm font-semibold">{text.hostUpdate}</h3>
              <Select
                label={text.hostStatus}
                value={nextStatus}
                disabled={mutation.isPending}
                options={allowed.map((status) => ({
                  value: status,
                  label: text.statusBadge(status).label,
                }))}
                onChange={(event) => {
                  const selected = allowed.find((status) => status === event.target.value);
                  if (selected) setTarget(selected);
                }}
              />
              <Textarea
                label={nextStatus === "RESOLVED" ? text.hostResult : text.hostNote}
                required
                rows={4}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                disabled={mutation.isPending}
              />
              <p className="text-xs text-[var(--ink-secondary)]">{text.hostNoteHint}</p>
            </section>
          ) : (
            <p className="rounded-lg bg-[var(--surface-subtle)] p-3 text-sm text-[var(--ink-secondary)]">
              {text.hostClosed}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
