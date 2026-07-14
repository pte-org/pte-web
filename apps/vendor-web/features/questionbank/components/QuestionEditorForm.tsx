"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Input } from "@aptis/ui";

const TEXT = {
  HEADING: "Create Multiple-Choice Question",
  QUESTION_LABEL: "Question Content",
  OPTION_LABEL: "Option",
  CORRECT_LABEL: "Correct Answer",
  ADD_OPTION: "Add Option",
  REMOVE: "Remove",
  SUBMIT: "Save Question",
  API_UNAVAILABLE: "Question create/update API is not wired on this screen yet.",
} as const;

const MIN_OPTIONS = 2;

export const QuestionEditorForm = (): ReactElement => {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);

  const updateOption = (index: number, value: string): void =>
    setOptions((prev) => prev.map((option, i) => (i === index ? value : option)));

  const addOption = (): void => setOptions((prev) => [...prev, ""]);

  const removeOption = (index: number): void =>
    setOptions((prev) =>
      prev.length > MIN_OPTIONS ? prev.filter((_, i) => i !== index) : prev,
    );

  return (
    <form className="flex max-w-2xl flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">{TEXT.HEADING}</h2>
      <Alert tone="info">{TEXT.API_UNAVAILABLE}</Alert>
      <Input
        label={TEXT.QUESTION_LABEL}
        value={questionText}
        onChange={(event) => setQuestionText(event.target.value)}
      />
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-gray-700">
          {TEXT.OPTION_LABEL}
        </legend>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-option"
              checked={correctIndex === index}
              onChange={() => setCorrectIndex(index)}
              aria-label={`${TEXT.CORRECT_LABEL} ${index + 1}`}
            />
            <div className="flex-1">
              <Input
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`${TEXT.OPTION_LABEL} ${index + 1}`}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeOption(index)}
              disabled={options.length <= MIN_OPTIONS}
            >
              {TEXT.REMOVE}
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addOption}
        >
          {TEXT.ADD_OPTION}
        </Button>
      </fieldset>
      <Button type="button" disabled>
        {TEXT.SUBMIT}
      </Button>
    </form>
  );
};
