"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PHASES, SESSIONS_UNTIL_LONG, type Phase } from "./types";
import ProgressRing from "./ProgressRing";
import SessionDots from "./SessionDots";
import BreathingGuide from "./BreathingGuide";

// ─── TimerSection ─────────────────────────────────────────────────────────────

interface TimerSectionProps {
    isDark: boolean;
    cardBg: string;
    phase: Phase;
    timeLeft: number;
    running: boolean;
    pct: number;
    sessionsDone: number;
    customFocus: number;
    fmt: (s: number) => string;
    onSwitchPhase: (p: Phase) => void;
    onReset: () => void;
    onResetSession: () => void;
    onPlayPause: () => void;
    onSkip: () => void;
}

export default function TimerSection({
    isDark, cardBg, phase, timeLeft, running, pct,
    sessionsDone, customFocus, fmt,
    onSwitchPhase, onReset, onResetSession, onPlayPause, onSkip,
}: TimerSectionProps) {
    const current = PHASES[phase];

    return (
        <section
            className="flex-1 flex flex-col items-center justify-center gap-[3vh] overflow-y-auto lg:overflow-hidden py-8 lg:py-0 border-b lg:border-b-0 lg:border-r"
            style={{ borderColor: isDark ? "#2A2A2A" : "#E5E7EB" }}>

            {/* Phase Switcher */}
            <div className={`flex gap-1 rounded-full p-1 border ${cardBg}`}>
                {(Object.entries(PHASES) as [Phase, typeof PHASES[Phase]][]).map(([key, val]) => (
                    <button key={key} id={`phase-${key}`} onClick={() => onSwitchPhase(key)}
                        className={`px-3 sm:px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer ${phase === key ? "text-white shadow-lg" : "opacity-40 hover:opacity-70"}`}
                        style={phase === key ? { backgroundColor: val.color } : {}}>
                        {key === "focus" ? "Focus" : key === "short" ? "Short" : "Long"}
                    </button>
                ))}
            </div>

            {/* Timer Ring or Breathing Guide */}
            <AnimatePresence mode="wait">
                {(phase === "short" || phase === "long") && running ? (
                    <motion.div key="breathing"
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                        <BreathingGuide color={current.color} />
                    </motion.div>
                ) : (
                    <motion.div key="timer"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="relative flex items-center justify-center select-none"
                        style={{ width: "min(42vh, 320px)", height: "min(42vh, 320px)" }}>
                        <ProgressRing pct={pct} color={current.color} />
                        <div className="flex flex-col items-center gap-1 z-10">
                            <motion.span key={phase}
                                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                className="font-bold uppercase tracking-[0.3em] opacity-40"
                                style={{ fontSize: "clamp(9px, 1.2vh, 13px)" }}>
                                {current.label}
                            </motion.span>
                            <div className="font-semibold geo-nums tabular-nums leading-none"
                                style={{ fontSize: "clamp(3.5rem, 9vh, 7rem)", color: running ? current.color : undefined }}>
                                {fmt(timeLeft)}
                            </div>
                            <span className="opacity-30 mt-1" style={{ fontSize: "clamp(9px, 1.2vh, 13px)" }}>
                                Session {(sessionsDone % SESSIONS_UNTIL_LONG) + 1} / {SESSIONS_UNTIL_LONG}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Session Dots */}
            <SessionDots completed={sessionsDone % SESSIONS_UNTIL_LONG} color={current.color} />

            {/* Controls */}
            <div className="flex items-center gap-4">
                <button id="btn-reset" onClick={onReset}
                    className={`w-12 h-12 rounded-full border ${cardBg} cursor-pointer flex items-center justify-center opacity-60 hover:opacity-100 transition-all active:scale-95`}
                    aria-label="Reset timer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                    </svg>
                </button>

                <motion.button id="btn-play-pause"
                    onClick={onPlayPause}
                    className="w-20 h-20 rounded-full text-white cursor-pointer flex items-center justify-center shadow-2xl transition-all active:scale-95"
                    style={{ backgroundColor: current.color }}
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
                    aria-label={running ? "Pause" : "Start"}>
                    <AnimatePresence mode="wait">
                        {running
                            ? <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                                </svg>
                            </motion.div>
                            : <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            </motion.div>
                        }
                    </AnimatePresence>
                </motion.button>

                <button id="btn-skip" onClick={onSkip}
                    className={`w-12 h-12 rounded-full border ${cardBg} cursor-pointer flex items-center justify-center opacity-60 hover:opacity-100 transition-all active:scale-95`}
                    aria-label="Skip">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>
            </div>

            {/* Stats */}
            <div className={`flex gap-5 sm:gap-8 rounded-2xl border ${cardBg} px-6 py-4 text-center`}>
                <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-bold geo-nums" style={{ color: PHASES.focus.color }}>{sessionsDone}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-40">Sessions</span>
                </div>
                <div className={`w-px self-stretch ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-bold geo-nums" style={{ color: PHASES.focus.color }}>{sessionsDone * customFocus}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-40">Min Focused</span>
                </div>
                <div className={`w-px self-stretch ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
                <div className="flex flex-col gap-0.5">
                    <span className="text-2xl font-bold geo-nums" style={{ color: PHASES.long.color }}>{Math.floor(sessionsDone / SESSIONS_UNTIL_LONG)}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-40">Long Breaks</span>
                </div>
            </div>

            {/* Reset Sessions */}
            <button id="btn-reset-session" onClick={onResetSession}
                className="text-xs opacity-25 hover:opacity-60 cursor-pointer transition-all flex items-center gap-1.5"
                aria-label="Reset all sessions">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
                Reset all sessions
            </button>
        </section>
    );
}
