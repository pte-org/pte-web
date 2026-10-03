"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Select, Textarea } from "@pte/ui";
import {
  CATEGORY_OPTIONS,
  CREATE_TICKET_ERRORS as E,
  CREATE_TICKET_TEXT as T,
  EMPTY_CREATE_TICKET,
  SERVER_ERROR_MAP,
} from "../constants";
import { validateCreateTicket } from "../utils/validateCreateTicket";
import type { CreateTicketErrors, CreateTicketInput } from "../types";

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTicketInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const FORM_ID = "create-ticket-form";

export const CreateTicketModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: CreateTicketModalProps): ReactElement => {
  const [form, setForm] = useState<CreateTicketInput>(EMPTY_CREATE_TICKET);
  const [errors, setErrors] = useState<CreateTicketErrors>({});

  const set = <K extends keyof CreateTicketInput>(field: K, value: CreateTicketInput[K]): void =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateTicket(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  const handleClose = (): void => {
    setForm(EMPTY_CREATE_TICKET);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={T.TITLE}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.CANCEL}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:opacity-50"
          >
            {isSubmitting ? "Submitting…" : T.SUBMIT}
          </button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <Alert tone="error">{SERVER_ERROR_MAP[error] ?? error}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="ticket-category">
            {T.CATEGORY_LABEL}
          </label>
          <Select
            id="ticket-category"
            value={form.category}
            onChange={(e) => {
            const val = e.target.value as CreateTicketInput["category"];
            set("category", val);
            if (val !== "CONTENT_COMPLAINT") set("entityId", "");
          }}
            options={[{ value: "", label: T.CATEGORY_PLACEHOLDER }, ...CATEGORY_OPTIONS]}
          />
          {errors.category && <p className="text-xs text-red-600">{errors.category}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="ticket-description">
            {T.DESCRIPTION_LABEL}
          </label>
          <Textarea
            id="ticket-description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={T.DESCRIPTION_PLACEHOLDER}
            rows={5}
          />
          <div className="flex justify-between">
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">{form.description.length} / 2000</span>
          </div>
        </div>

        {form.category === "CONTENT_COMPLAINT" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="ticket-session-id">
              {T.SESSION_ID_LABEL}
            </label>
            <input
              id="ticket-session-id"
              type="text"
              value={form.entityId}
              onChange={(e) => set("entityId", e.target.value)}
              placeholder={T.SESSION_ID_PLACEHOLDER}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-action focus:outline-none focus:ring-1 focus:ring-action"
            />
            {errors.entityId && <p className="text-xs text-red-600">{errors.entityId}</p>}
          </div>
        )}
      </form>
    </Modal>
  );
};
