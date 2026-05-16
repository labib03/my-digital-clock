"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Play, Pause, RotateCcw, SkipForward, RefreshCw, Star, Shield, Zap } from "lucide-react";

import { PHASES, type Phase } from "./types";
import ProgressRing from "./ProgressRing";
import SessionDots from "./SessionDots";
import BreathingGuide from "./BreathingGuide";
import MiniTimerPlayer from "./MiniTimerPlayer";
import { useLanguage } from "@/components/shared/LanguageContext";

interface TimerSectionProps {
    isDark: boolean;
    phase: Phase;
    timeLeft: number;
    running: boolean;
    pct: number;
    sessionsDone: number;
    customFocus: number;
    sessionsUntilLong: number;
    fmt: (s: number) => string;
    onSwitchPhase: (p: Phase) => void;
    onReset: () => void;
    onResetSession: () => void;
    onPlayPause: () => void;
    onSkip: () => void;
}

export default function TimerSection({
    isDark, phase, timeLeft, running, pct,
    sessionsDone, customFocus, sessionsUntilLong, fmt,
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

    const gamePanel = isDark
        ? "bg-[#1E1E24] border-2 sm:border-[3px] border-[#0F0F13] shadow-[0_4px_0_#0F0F13] sm:shadow-[0_6px_0_#0F0F13]"
        : "bg-white border-2 sm:border-[3px] border-[#E2E8F0] shadow-[0_4px_0_#CBD5E1] sm:shadow-[0_6px_0_#CBD5E1]";

    const gameButton = isDark
        ? "bg-[#2A2A35] border-2 sm:border-[3px] border-[#0F0F13] text-white shadow-[0_3px_0_#0F0F13] sm:shadow-[0_4px_0_#0F0F13] hover:brightness-110"
        : "bg-white border-2 sm:border-[3px] border-[#CBD5E1] text-slate-700 shadow-[0_3px_0_#94A3B8] sm:shadow-[0_4px_0_#94A3B8] hover:brightness-95";

    return (
        <>
            <section className="relative lg:flex-1 flex flex-col items-center py-[clamp(1rem,3vmin,2.5rem)] lg:overflow-hidden shrink-0 scroll-smooth z-10 w-full">
                <div className="flex-1 flex flex-col items-center justify-center gap-[clamp(0.75rem,3.5vmin,2rem)] w-full max-w-md mx-auto px-4">

                    {/* 1. DYNAMIC TABS BLOCK */}
                    <div className={`relative flex p-[clamp(4px,1vmin,8px)] rounded-2xl ${gamePanel}`}>
                        {(Object.entries(PHASES) as [Phase, typeof PHASES[Phase]][]).map(([key, val]) => {
                            const isActive = phase === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onSwitchPhase(key)}
                                    className="relative px-[clamp(0.75rem,2.5vmin,1.5rem)] py-[clamp(0.35rem,1.5vmin,0.65rem)] rounded-xl font-bold uppercase tracking-widest z-10 transition-colors"
                                    style={{
                                        color: isActive ? '#fff' : (isDark ? '#888' : '#666'),
                                        fontSize: "clamp(9px, 1.5vmin, 12px)"
                                    }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="gameActivePhase"
                                            className="absolute inset-0 rounded-xl z-[-1] border-2 border-black/10 shadow-[0_3px_0_rgba(0,0,0,0.2)]"
                                            style={{ backgroundColor: val.color }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        />
                                    )}
                                    <span className="drop-shadow-sm">{getPhaseLabel(key)}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* 2. DYNAMIC TIMER ARENA */}
                    <div ref={timerRef} className="flex justify-center w-full relative">
                        <AnimatePresence mode="wait">
                            {(phase === "short" || phase === "long") && running ? (
                                <motion.div key="breathing"
                                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative flex items-center justify-center select-none"
                                    style={{
                                        width: "clamp(190px, 36vmin, 270px)",
                                        height: "clamp(190px, 36vmin, 270px)"
                                    }}>
                                    <BreathingGuide color={current.color} />
                                </motion.div>
                            ) : (
                                <motion.div key="timer"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="relative flex items-center justify-center select-none"
                                    style={{
                                        width: "clamp(190px, 36vmin, 270px)",
                                        height: "clamp(190px, 36vmin, 270px)"
                                    }}>

                                    <div className={`absolute inset-[clamp(10px,2vmin,16px)] rounded-full border-[clamp(4px,1vmin,8px)] ${isDark ? 'border-[#1E1E24]' : 'border-[#F1F5F9]'} shadow-inner`} />
                                    <ProgressRing pct={pct} color={current.color} />

                                    <div className="flex flex-col items-center justify-center z-10">
                                        <div className="font-extrabold geo-nums tabular-nums leading-none tracking-tighter drop-shadow-md"
                                            style={{
                                                fontSize: "clamp(2.75rem, 8.5vmin, 4.5rem)",
                                                color: running ? current.color : (isDark ? '#fff' : '#333')
                                            }}>
                                            {fmt(timeLeft)}
                                        </div>
                                        <motion.span key={phase} className="font-bold uppercase tracking-[0.2em] opacity-50 text-[clamp(8px,1.2vmin,10px)] mt-1.5 bg-black/5 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                                            Level {(sessionsDone % sessionsUntilLong) + 1}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* DYNAMIC SESSION DOTS CONTAINER */}
                    <div className="h-[12px] flex items-center justify-center">
                        <SessionDots completed={sessionsDone % sessionsUntilLong} total={sessionsUntilLong} color={current.color} />
                    </div>

                    {/* 3. DYNAMIC CONTROLS */}
                    <div className="flex items-center gap-[clamp(0.75rem,3vmin,1.5rem)] mt-0.5">
                        <motion.button onClick={onReset}
                            className={`rounded-2xl flex items-center justify-center transition-colors ${gameButton}`}
                            style={{
                                width: "clamp(2.75rem, 7.5vmin, 3.5rem)",
                                height: "clamp(2.75rem, 7.5vmin, 3.5rem)"
                            }}
                            whileTap={{ y: 3, boxShadow: "0 0px 0 rgba(0,0,0,0)" }}
                            aria-label={t('reset')}>
                            <RotateCcw strokeWidth={3} style={{ width: "clamp(16px, 3.5vmin, 22px)", height: "clamp(16px, 3.5vmin, 22px)" }} />
                        </motion.button>

                        <motion.button
                            onClick={onPlayPause}
                            className="rounded-[clamp(1.25rem,3.5vmin,1.75rem)] text-white flex items-center justify-center border-b-[4px] sm:border-b-[5px] border-black/20"
                            style={{
                                backgroundColor: current.color,
                                boxShadow: `0 5px 0 ${current.color}80`,
                                width: "clamp(4.25rem, 11.5vmin, 5.5rem)",
                                height: "clamp(4.25rem, 11.5vmin, 5.5rem)"
                            }}
                            whileTap={{ y: 5, boxShadow: `0 0px 0 ${current.color}80`, borderBottomWidth: "0px", marginTop: "4px" }}
                        >
                            <AnimatePresence mode="wait">
                                {running
                                    ? <motion.div key="pause" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                        <Pause fill="currentColor" style={{ width: "clamp(26px, 6.5vmin, 40px)", height: "clamp(26px, 6.5vmin, 40px)" }} />
                                    </motion.div>
                                    : <motion.div key="play" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                        <Play fill="currentColor" className="ml-1" style={{ width: "clamp(26px, 6.5vmin, 40px)", height: "clamp(26px, 6.5vmin, 40px)" }} />
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </motion.button>

                        <motion.button onClick={onSkip}
                            className={`rounded-2xl flex items-center justify-center transition-colors ${gameButton}`}
                            style={{
                                width: "clamp(2.75rem, 7.5vmin, 3.5rem)",
                                height: "clamp(2.75rem, 7.5vmin, 3.5rem)"
                            }}
                            whileTap={{ y: 3, boxShadow: "0 0px 0 rgba(0,0,0,0)" }}
                            aria-label={t('skip')}>
                            <SkipForward strokeWidth={3} style={{ width: "clamp(16px, 3.5vmin, 22px)", height: "clamp(16px, 3.5vmin, 22px)" }} />
                        </motion.button>
                    </div>

                    {/* 4. DYNAMIC STATS PANEL & RESET BUTTON (MERGED) */}
                    <div className="relative w-full mt-0.5">

                        {/* Tombol Reset All Sessions - Melayang di kanan atas */}
                        <button
                            onClick={onResetSession}
                            title={t('resetAllSessions')}
                            aria-label={t('resetAllSessions')}
                            className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-20 
                                flex items-center justify-center rounded-full transition-all duration-300
                                opacity-60 hover:opacity-100 hover:scale-110 active:scale-95
                                ${isDark
                                    ? 'bg-[#2A2A35] text-white/70 hover:text-red-400 border border-[#1E1E24]'
                                    : 'bg-white text-slate-500 hover:text-red-500 border border-slate-200 shadow-sm'}`}
                            style={{
                                width: "clamp(24px, 4.5vmin, 32px)",
                                height: "clamp(24px, 4.5vmin, 32px)"
                            }}
                        >
                            <RefreshCw strokeWidth={2.5} style={{ width: "clamp(12px, 2vmin, 16px)", height: "clamp(12px, 2vmin, 16px)" }} />
                        </button>

                        <div className={`w-full grid grid-cols-3 gap-[clamp(4px,1.5vmin,12px)] rounded-2xl p-[clamp(0.5rem,2.5vmin,1rem)] ${gamePanel}`}>
                            <div className="flex flex-col items-center justify-center gap-0.5">
                                <Star className="text-yellow-400 drop-shadow-sm mb-0.5" fill="currentColor" style={{ width: "clamp(11px, 2vmin, 15px)", height: "clamp(11px, 2vmin, 15px)" }} />
                                <span className="font-black geo-nums leading-none" style={{ fontSize: "clamp(1.1rem, 4vmin, 1.5rem)" }}>{sessionsDone}</span>
                                <span className="font-bold uppercase tracking-widest opacity-50" style={{ fontSize: "clamp(7px, 1.2vmin, 9px)" }}>Streaks</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-0.5 border-x-2 border-dashed" style={{ borderColor: isDark ? '#2A2A35' : '#E2E8F0' }}>
                                <Zap className="text-blue-400 drop-shadow-sm mb-0.5" fill="currentColor" style={{ width: "clamp(11px, 2vmin, 15px)", height: "clamp(11px, 2vmin, 15px)" }} />
                                <span className="font-black geo-nums leading-none" style={{ fontSize: "clamp(1.1rem, 4vmin, 1.5rem)" }}>{sessionsDone * customFocus}</span>
                                <span className="font-bold uppercase tracking-widest opacity-50" style={{ fontSize: "clamp(7px, 1.2vmin, 9px)" }}>EXP (Min)</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-0.5">
                                <Shield className="text-green-400 drop-shadow-sm mb-0.5" fill="currentColor" style={{ width: "clamp(11px, 2vmin, 15px)", height: "clamp(11px, 2vmin, 15px)" }} />
                                <span className="font-black geo-nums leading-none" style={{ fontSize: "clamp(1.1rem, 4vmin, 1.5rem)" }}>{Math.floor(sessionsDone / sessionsUntilLong)}</span>
                                <span className="font-bold uppercase tracking-widest opacity-50" style={{ fontSize: "clamp(7px, 1.2vmin, 9px)" }}>Rewards</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <AnimatePresence>
                {!timerInView && (
                    <MiniTimerPlayer phase={phase} timeLeft={timeLeft} running={running} isDark={isDark} fmt={fmt} onPlayPause={onPlayPause} onSkip={onSkip} />
                )}
            </AnimatePresence>
        </>
    );
}