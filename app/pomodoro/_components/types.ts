// ─── Shared Types & Constants ─────────────────────────────────────────────────

export type Phase = "focus" | "short" | "long";
export type SoundOption = "off" | "white" | "brown";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  isActive?: boolean;
  estimatedPomodoros?: number;
  completedPomodoros?: number;
}

// PHASES sekarang hanya digunakan untuk referensi UI (warna tema).
export const PHASES: Record<Phase, { color: string }> = {
  focus: { color: "#3B82F6" },
  short: { color: "#10B981" },
  long: { color: "#F97316" },
};

// Konstanta default untuk inisialisasi awal di page.tsx
export const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLong: 4,
};

export const BREATHING = { inhale: 4, hold: 7, exhale: 8 };
export const BREATHING_CYCLE =
  BREATHING.inhale + BREATHING.hold + BREATHING.exhale;
export type BreathPhase = "inhale" | "hold" | "exhale";
