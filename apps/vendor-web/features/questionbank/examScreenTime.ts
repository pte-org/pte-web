const SECONDS_PER_MINUTE = 60;

const pad = (value: number): string => String(value).padStart(2, "0");

/** "01:05" for 65 seconds; the app's clocks show whole seconds as mm:ss. */
export const formatClock = (seconds: number): string => {
  const whole = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${pad(Math.floor(whole / SECONDS_PER_MINUTE))}:${pad(whole % SECONDS_PER_MINUTE)}`;
};
