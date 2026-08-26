"use client";

import { useState, type ReactElement } from "react";
import { Modal } from "@pte/ui";
import { SUSPEND_MODAL_TEXT } from "../constants";
import type { Tenant } from "../types";

interface SuspendTenantModalProps {
  /**
   * The tenant to suspend; `null` keeps the modal closed. Callers should key
   * this component by `tenant.id` so the confirmation input resets per tenant.
   */
  tenant: Tenant | null;
  onCancel: () => void;
  onConfirm: (tenant: Tenant) => void;
}

export const SuspendTenantModal = ({
  tenant,
  onCancel,
  onConfirm,
}: SuspendTenantModalProps): ReactElement => {
  const [typedName, setTypedName] = useState("");

  const confirmed = tenant !== null && typedName.trim() === tenant.name;

  return (
    <Modal
      open={tenant !== null}
      onClose={onCancel}
      title={SUSPEND_MODAL_TEXT.TITLE}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            {SUSPEND_MODAL_TEXT.CANCEL}
          </button>
          <button
            type="button"
            disabled={!confirmed}
            onClick={() => tenant && onConfirm(tenant)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {SUSPEND_MODAL_TEXT.CONFIRM}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{SUSPEND_MODAL_TEXT.WARNING}</p>
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="text-sm text-gray-600">
          {SUSPEND_MODAL_TEXT.CONFIRM_PROMPT}
        </p>
        <p className="mt-1 font-semibold text-gray-900">{tenant?.name}</p>
      </div>
      <label
        htmlFor="suspend-tenant-name"
        className="mt-4 block text-sm font-medium text-gray-700"
      >
        {SUSPEND_MODAL_TEXT.INPUT_LABEL}
      </label>
      <input
        id="suspend-tenant-name"
        type="text"
        value={typedName}
        onChange={(event) => setTypedName(event.target.value)}
        placeholder={SUSPEND_MODAL_TEXT.INPUT_PLACEHOLDER}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
      />
    </Modal>
  );
};
