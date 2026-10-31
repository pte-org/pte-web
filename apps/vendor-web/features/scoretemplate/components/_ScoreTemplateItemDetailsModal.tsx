"use client";

import type { ReactElement } from "react";
import { Button, Input, Modal } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  SCORE_TEMPLATE_DETAIL_FIELDS,
  SCORE_TEMPLATE_ITEM_HEADERS as RAW_SCORE_TEMPLATE_ITEM_HEADERS,
  SCORE_TEMPLATE_ROW_TEXT as RAW_SCORE_TEMPLATE_ROW_TEXT,
} from "../constants";
import type { ScoreTemplateItemDraft } from "../types";

const MIN_FIELD_VALUE = 0;

interface ScoreTemplateItemDetailsModalProps {
  /** The draft row being edited; `undefined` keeps the dialog closed. */
  item: ScoreTemplateItemDraft | undefined;
  onClose: () => void;
  /** Edits write straight into the draft, so there is nothing to confirm or cancel. */
  onChange: (field: keyof ScoreTemplateItemDraft, value: string) => void;
}

/** The fields a row does not show inline: counts, timing and every skill's weight. */
export const ScoreTemplateItemDetailsModal = ({
  item,
  onClose,
  onChange,
}: ScoreTemplateItemDetailsModalProps): ReactElement => {
  const H = useAdminCopy(RAW_SCORE_TEMPLATE_ITEM_HEADERS);
  const ROW = useAdminCopy(RAW_SCORE_TEMPLATE_ROW_TEXT);

  return (
    <Modal
      open={item !== undefined}
      onClose={onClose}
      title={ROW.DETAILS_TITLE}
      size="lg"
      footer={<Button onClick={onClose}>{ROW.DETAILS_DONE}</Button>}
    >
      {item && (
        <div className="space-y-4">
          <p className="font-mono text-sm text-[var(--ink-secondary)]">{item.taskTypeKey}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SCORE_TEMPLATE_DETAIL_FIELDS.map(({ field, header, step }) => (
              <Input
                key={field}
                type="number"
                min={MIN_FIELD_VALUE}
                step={step}
                label={H[header]}
                value={item[field]}
                onChange={(event) => onChange(field, event.target.value)}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
