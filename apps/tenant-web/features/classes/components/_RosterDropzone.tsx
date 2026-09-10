"use client";

import { useState, type ChangeEvent, type DragEvent, type ReactElement } from "react";
import { cn } from "@pte/ui";

const ACCEPTED_FILE_TYPE = ".xlsx";

interface RosterDropzoneProps {
  fileName?: string;
  dropPrompt: string;
  fileInputLabel: string;
  onFileSelected: (file: File) => void;
}

/**
 * Private to `features/classes` — mirrors `examoperations`'s own
 * `_RosterDropzone.tsx` (that file is `_`-prefixed and not exported from
 * its feature's barrel, signaling it's meant to stay internal, so it isn't
 * imported cross-feature here). The reusable piece — `parseRosterFile` —
 * is imported directly instead; only this small presentational shell is
 * mirrored.
 */
export const RosterDropzone = ({
  fileName,
  dropPrompt,
  fileInputLabel,
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
      <span className="text-gray-600">{dropPrompt}</span>
      {fileName && <span className="font-medium text-gray-900">{fileName}</span>}
      <input
        type="file"
        accept={ACCEPTED_FILE_TYPE}
        aria-label={fileInputLabel}
        className="hidden"
        onChange={(event: ChangeEvent<HTMLInputElement>) => handleFiles(event.target.files)}
      />
    </label>
  );
};
