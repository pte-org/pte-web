"use client";

import { useEffect, useRef } from "react";
import type { CreateQuestionRequest, OptionRequest, QuestionPool } from "@pte/api-client";

/** The question form's setters an AI agent's values are written through. */
export interface AgentValueSetters {
  setTaskType: (value: string) => void;
  setPool: (value: QuestionPool) => void;
  setCefrLevel: (value: string) => void;
  setPromptText: (value: string) => void;
  setReferenceAnswerText: (value: string) => void;
  setCorrectAnswerText: (value: string) => void;
  setMinWordCount: (value: string) => void;
  setMaxWordCount: (value: string) => void;
  setAudioPromptRef: (value: string | null) => void;
  setImagePromptRef: (value: string | null) => void;
  setOptions: (value: OptionRequest[]) => void;
  setAnswerHintVi: (value: string) => void;
  setAnswerHintEn: (value: string) => void;
}

const numberText = (value: number | null | undefined): string => (value == null ? "" : String(value));

/**
 * Puts what an agent has written so far into the form each time it grows. Nothing happens without agent values, so
 * a person editing the form by hand is never overwritten.
 */
export function useAgentValues(values: Partial<CreateQuestionRequest> | undefined, set: AgentValueSetters): void {
  const latest = useRef({ values, set });
  useEffect(() => {
    latest.current = { values, set };
  });
  // Keyed on the content, not the object: the page renders again while polling, and once the agents are done a
  // person may be editing; only new agent text is written into the form.
  const contentKey = values ? JSON.stringify(values) : "";
  useEffect(() => {
    const { values, set } = latest.current;
    if (!values || Object.keys(values).length === 0) return;
    if (values.pteTaskType) set.setTaskType(values.pteTaskType);
    if (values.pool) set.setPool(values.pool);
    if (values.cefrLevel !== undefined) set.setCefrLevel(values.cefrLevel ?? "");
    set.setPromptText(values.promptText ?? "");
    set.setReferenceAnswerText(values.referenceAnswerText ?? "");
    set.setCorrectAnswerText(values.correctAnswerText ?? "");
    set.setMinWordCount(numberText(values.minWordCount));
    set.setMaxWordCount(numberText(values.maxWordCount));
    if (values.audioPromptRef) set.setAudioPromptRef(values.audioPromptRef);
    if (values.imagePromptRef) set.setImagePromptRef(values.imagePromptRef);
    if (values.options) set.setOptions(values.options);
    set.setAnswerHintVi(values.answerHintVi ?? "");
    set.setAnswerHintEn(values.answerHintEn ?? "");
  }, [contentKey]);
}
