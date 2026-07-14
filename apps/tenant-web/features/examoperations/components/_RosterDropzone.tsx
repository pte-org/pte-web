"use client";

import {
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactElement,
} from "react";
import { cn } from "@aptis/ui";
import { ACCEPTED_FILE_TYPE, ROSTER_TEXT } from "./constants";

interface RosterDropzoneProps {
  fileName?: string;
  onFileSelected: (file: File) => void;
}

export const RosterDropzone = ({
  fileName,
  onFileSelected,
}: RosterDropzoneProps): ReactElement => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | null): void => {
    const file = files?.[0];
    if (file) onFileSelected(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center text-sm",
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
      )}
    >
      <span className="text-gray-600">{ROSTER_TEXT.DROP_PROMPT}</span>
      {fileName && (
        <span className="font-medium text-gray-900">{fileName}</span>
      )}
      <input
        type="file"
        accept={ACCEPTED_FILE_TYPE}
        aria-label={ROSTER_TEXT.FILE_INPUT_LABEL}
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          handleFiles(event.target.files)
        }
      />
    </label>
  );
};
