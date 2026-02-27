// ─── Shared Types & Constants ─────────────────────────────────────────────────

export type Phase = "focus" | "short" | "long";
export type SoundOption = "off" | "white" | "brown";

export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export const PHASES: Record<
  Phase,
  { label: string; duration: number; color: string }
> = {
  focus: { label: "Focus", duration: 25 * 60, color: "#3B82F6" },
  short: { label: "Short Break", duration: 5 * 60, color: "#10B981" },
  long: { label: "Long Break", duration: 15 * 60, color: "#F97316" },
};

export const SESSIONS_UNTIL_LONG = 4;

export const BREATHING = { inhale: 4, hold: 7, exhale: 8 };
export const BREATHING_CYCLE =
  BREATHING.inhale + BREATHING.hold + BREATHING.exhale;
export type BreathPhase = "inhale" | "hold" | "exhale";
