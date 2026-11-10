"use client";
import type { ReactElement } from "react";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";

interface TranscriptBlockProps {
  label: string;
  text: string | null | undefined;
}

/** Text of an audio clip, so the examiner can read along instead of relying on listening alone. */
export const TranscriptBlock = ({ label, text }: TranscriptBlockProps): ReactElement => {
  const T = useExaminerWorkText();
  const body = text?.trim();
  return <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    {body ? <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">{body}</p>
      : <p className="mt-1 text-xs italic text-slate-500">{T.TRANSCRIPT_MISSING}</p>}
  </div>;
};
