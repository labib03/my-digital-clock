"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Play, Pause, RotateCcw, SkipForward, RefreshCw } from "lucide-react";

import { PHASES, SESSIONS_UNTIL_LONG, type Phase } from "./types";
import ProgressRing from "./ProgressRing";
import SessionDots from "./SessionDots";
import BreathingGuide from "./BreathingGuide";
import MiniTimerPlayer from "./MiniTimerPlayer";
import { useLanguage } from "@/components/shared/LanguageContext";

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
    const { t } = useLanguage();
    const current = PHASES[phase];

    const { ref: timerRef, inView: timerInView } = useInView({
        threshold: 0.1,
        initialInView: true,
    });

    const getPhaseLabel = (p: Phase) => {
        if (p === "focus") return t('focus');
        if (p === "short") return t('shortBreak');
        if (p === "long") return t('longBreak');
        return "";
    };

    return (
        <>
            <section
                className="relative lg:flex-1 flex flex-col items-center py-12 lg:py-0 gap-[4vh] lg:overflow-hidden lg:border-r shrink-0 scroll-smooth"
                style={{ borderColor: isDark ? "#2A2A2A" : "#E5E7EB" }}
            >
                <div className="flex-1 flex flex-col items-center justify-center gap-[4vh] w-full max-w-md mx-auto px-6">

                    {/* Modern Phase Switcher */}
                    <div className={`relative flex p-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        {(Object.entries(PHASES) as [Phase, typeof PHASES[Phase]][]).map(([key, val]) => {
                            const isActive = phase === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onSwitchPhase(key)}
                                    className="relative px-4 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-colors z-10"
                                    style={{ color: isActive ? (isDark ? '#000' : '#fff') : 'inherit' }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activePhaseBackground"
                                            className="absolute inset-0 rounded-full shadow-md z-[-1]"
                                            style={{ backgroundColor: val.color }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={isActive ? "opacity-100" : "opacity-50 hover:opacity-80"}>
                                        {getPhaseLabel(key)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Timer / Breathing Guide Area */}
                    <div ref={timerRef} className="flex justify-center w-full">
                        <AnimatePresence mode="wait">
                            {(phase === "short" || phase === "long") && running ? (
                                <motion.div key="breathing"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                                    <BreathingGuide color={current.color} />
                                </motion.div>
                            ) : (
                                <motion.div key="timer"
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="relative flex items-center justify-center select-none"
                                    style={{ width: "min(40vh, 300px)", height: "min(40vh, 300px)" }}>

                                    <ProgressRing pct={pct} color={current.color} />

                                    <div className="flex flex-col items-center gap-2 z-10">
                                        <motion.span key={phase}
                                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                                            className="font-bold uppercase tracking-[0.3em] opacity-40 text-[10px] sm:text-xs">
                                            {getPhaseLabel(phase)}
                                        </motion.span>

                                        <div className="font-semibold geo-nums tabular-nums leading-none tracking-tight"
                                            style={{ fontSize: "clamp(4rem, 10vh, 7.5rem)", color: running ? current.color : undefined }}>
                                            {fmt(timeLeft)}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <SessionDots completed={sessionsDone % SESSIONS_UNTIL_LONG} color={current.color} />

                    {/* Modern Controls */}
                    <div className="flex items-center gap-6 mt-2">
                        <button onClick={onReset}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-white/5 text-white/50 hover:text-white' : 'bg-black/5 text-black/40 hover:text-black'}`}
                            aria-label={t('reset')}>
                            <RotateCcw size={20} strokeWidth={2.5} />
                        </button>

                        <motion.button
                            onClick={onPlayPause}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] text-white flex items-center justify-center shadow-xl transition-shadow hover:shadow-2xl active:scale-95"
                            style={{ backgroundColor: current.color }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <AnimatePresence mode="wait">
                                {running
                                    ? <motion.div key="pause" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                                        <Pause size={36} fill="currentColor" />
                                    </motion.div>
                                    : <motion.div key="play" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}>
                                        <Play size={36} fill="currentColor" className="ml-2" />
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </motion.button>

                        <button onClick={onSkip}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isDark ? 'bg-white/5 text-white/50 hover:text-white' : 'bg-black/5 text-black/40 hover:text-black'}`}
                            aria-label={t('skip')}>
                            <SkipForward size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Stats Panel */}
                    <div className={`w-full grid grid-cols-3 gap-4 rounded-3xl p-6 mt-4 ${isDark ? 'bg-[#1A1A1A]/50' : 'bg-[#F9FAFB]'}`}>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-bold geo-nums" style={{ color: PHASES.focus.color }}>{sessionsDone}</span>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 text-center">{t('sessions')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 border-x" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                            <span className="text-2xl font-bold geo-nums" style={{ color: PHASES.focus.color }}>{sessionsDone * customFocus}</span>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 text-center">{t('minFocused')}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-bold geo-nums" style={{ color: PHASES.long.color }}>{Math.floor(sessionsDone / SESSIONS_UNTIL_LONG)}</span>
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-40 text-center">{t('longBreaks')}</span>
                        </div>
                    </div>

                    <button onClick={onResetSession}
                        className="text-xs opacity-30 hover:opacity-80 transition-all flex items-center gap-2 mt-2 mb-10 lg:mb-0">
                        <RefreshCw size={14} />
                        {t('resetAllSessions')}
                    </button>
                </div>
            </section>

            {/* Sticky Mini Player */}
            <AnimatePresence>
                {!timerInView && (
                    <MiniTimerPlayer
                        phase={phase}
                        timeLeft={timeLeft}
                        running={running}
                        isDark={isDark}
                        fmt={fmt}
                        onPlayPause={onPlayPause}
                        onSkip={onSkip}
                    />
                )}
            </AnimatePresence>
        </>
    );
}