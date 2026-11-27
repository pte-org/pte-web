import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import { TYPING_SPEED_ORDER, TYPING_TEXT, type TypingSpeed } from "../typingConstants";

interface ReplayControlsProps {
  speed: TypingSpeed;
  onSpeed: (speed: TypingSpeed) => void;
  locale: "vi" | "en";
}

/** The typing pace of the replay. */
export const ReplayControls = ({
  speed,
  onSpeed,
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
    </div>
  );
};
