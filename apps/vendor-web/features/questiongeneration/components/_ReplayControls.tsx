import type { ReactElement } from "react";
import { Button, Select } from "@pte/ui";
import { TYPING_SPEED_ORDER, TYPING_TEXT, type TypingSpeed } from "../typingConstants";

interface ReplayControlsProps {
  speed: TypingSpeed;
  onSpeed: (speed: TypingSpeed) => void;
  /** Text is still being written out, so it can be shown at once. */
  typing: boolean;
  onRevealAll: () => void;
  locale: "vi" | "en";
}

/** The typing pace of the replay and the way to skip the typing of what has already arrived. */
export const ReplayControls = ({
  speed,
  onSpeed,
  typing,
  onRevealAll,
  locale,
}: ReplayControlsProps): ReactElement => {
  const text = TYPING_TEXT[locale];
  const options = TYPING_SPEED_ORDER.map((value) => ({ value, label: text[value] }));
  return (
    <div className="flex items-center gap-2">
      <Select
        size="sm"
        aria-label={text.typingSpeed}
        title={text.typingSpeed}
        options={options}
        value={speed}
        onChange={(event) => {
          const picked = TYPING_SPEED_ORDER.find((value) => value === event.target.value);
          if (picked) onSpeed(picked);
        }}
      />
      {typing && (
        <Button size="sm" variant="ghost" onClick={onRevealAll}>
          {text.revealAll}
        </Button>
      )}
    </div>
  );
};
