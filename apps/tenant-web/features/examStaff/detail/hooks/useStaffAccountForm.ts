"use client";

import { useState } from "react";
import { ApiError, type ExamStaffAccountResponse } from "@pte/api-client";
import { useUpdateStaffProfile } from "../api";
import { staffProfileForm } from "../utils";
import { STAFF_WORKSPACE_UTC_OFFSET_MINUTES } from "../constants";
import type { StaffProfileForm } from "../types";
import type { StaffDetailText } from "./useStaffDetailText";

export const useStaffAccountForm = (account: ExamStaffAccountResponse, text: StaffDetailText): {
  form: StaffProfileForm; editing: boolean; dirty: boolean; pending: boolean;
  error: string | null; saved: boolean; start: () => void; cancel: () => void;
  change: (key: keyof StaffProfileForm, value: string) => void; save: () => void;
} => {
  const update = useUpdateStaffProfile();
  const [form, setForm] = useState(() => staffProfileForm(account));
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [baseline, setBaseline] = useState(() => staffProfileForm(account));
  const dirty = editing && JSON.stringify(form) !== JSON.stringify(baseline);
  const reset = (): void => {
    const original = staffProfileForm(account);
    setForm(original); setBaseline(original); setSaved(false); setInvalid(false); update.reset();
  };
  const save = (): void => {
    if (!dirty || update.isPending) return;
    const parsedDate = Date.parse(form.dateOfBirth);
    const today = new Date(Date.now() + STAFF_WORKSPACE_UTC_OFFSET_MINUTES * 60_000).toISOString().slice(0, 10);
    const validDate = !form.dateOfBirth || (/^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth)
      && !Number.isNaN(parsedDate) && new Date(parsedDate).toISOString().slice(0, 10) === form.dateOfBirth
      && form.dateOfBirth <= today);
    if (!form.fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) || !validDate) {
      setInvalid(true); return;
    }
    setInvalid(false);
    update.mutate({ publicId: account.publicId, payload: {
      fullName: form.fullName.trim(), email: form.email.trim(),
      phone: form.phone.trim() || null, dateOfBirth: form.dateOfBirth || null,
    } }, { onSuccess: (result) => {
      setForm(staffProfileForm(result));
      setBaseline(staffProfileForm(result));
      setSaved(true); setEditing(false);
    } });
  };
  return {
    form, editing, dirty, pending: update.isPending, saved, save,
    error: invalid ? text.invalidProfile : update.error instanceof ApiError && update.error.kind === "conflict"
      ? text.emailConflict : update.error ? text.genericError : null,
    start: () => { reset(); setEditing(true); },
    cancel: () => { if (!update.isPending) { reset(); setEditing(false); } },
    change: (key, value) => { setInvalid(false); setForm((current) => ({ ...current, [key]: value })); },
  };
};
