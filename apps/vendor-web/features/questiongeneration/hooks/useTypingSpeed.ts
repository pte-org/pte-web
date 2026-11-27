"use client";

import { useState } from "react";
import {
  DEFAULT_TYPING_SPEED,
  TYPING_SPEEDS,
  TYPING_SPEED_STORAGE_KEY,
  type TypingSpeed,
} from "../typingConstants";

export interface TypingSpeedChoice {
  speed: TypingSpeed;
  charsPerSecond: number;
  setSpeed: (speed: TypingSpeed) => void;
}

const isTypingSpeed = (value: string | null): value is TypingSpeed =>
  value !== null && Object.hasOwn(TYPING_SPEEDS, value);

/** The typing pace a person picked, kept in this browser; the default until they pick one. */
export const readTypingSpeed = (): TypingSpeed => {
  if (typeof window === "undefined") return DEFAULT_TYPING_SPEED;
  try {
    const stored = window.localStorage.getItem(TYPING_SPEED_STORAGE_KEY);
    return isTypingSpeed(stored) ? stored : DEFAULT_TYPING_SPEED;
  } catch {
    // Storage blocked (private mode, policy): the pace simply is not remembered.
    return DEFAULT_TYPING_SPEED;
  }
};

export const storeTypingSpeed = (speed: TypingSpeed): void => {
  try {
    window.localStorage.setItem(TYPING_SPEED_STORAGE_KEY, speed);
  } catch {
    // Not remembered when storage is blocked; the choice still applies on this page.
  }
};

export function useTypingSpeed(): TypingSpeedChoice {
  const [speed, setSpeedState] = useState<TypingSpeed>(readTypingSpeed);
  const setSpeed = (next: TypingSpeed): void => {
    setSpeedState(next);
    storeTypingSpeed(next);
  };
  return { speed, charsPerSecond: TYPING_SPEEDS[speed], setSpeed };
}
