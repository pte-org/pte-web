"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Input } from "@pte/ui";

const TEXT = {
  HEADING: "Create Exam",
  NAME_LABEL: "Exam Name",
  QUESTIONS_HINT:
    "Questions will appear here when the question bank is ready.",
  SUBMIT: "Save Exam",
  API_UNAVAILABLE: "Exam composition API is not wired on this screen yet.",
} as const;

export const ExamBuilderForm = (): ReactElement => {
  const [name, setName] = useState("");

  return (
    <form className="flex max-w-2xl flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">{TEXT.HEADING}</h2>
      <Alert tone="info">{TEXT.API_UNAVAILABLE}</Alert>
      <Input
        label={TEXT.NAME_LABEL}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <p className="rounded-md border border-dashed border-gray-300 p-4 text-sm text-gray-500">
        {TEXT.QUESTIONS_HINT}
      </p>
      <Button type="button" disabled>
        {TEXT.SUBMIT}
      </Button>
    </form>
  );
};
