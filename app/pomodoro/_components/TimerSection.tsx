"use client";

import Image from "next/image";
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
    sessionsUntilLong: number; // Prop baru ditambahkan
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

    const petAnimation = {
        animate: {
            y: running && phase === "focus" ? [0, -6, 0] : [0, -2, 0],
            scale: phase === "focus" ? 1 : 0.95,
            opacity: phase === "focus" ? 1 : 0.7,
            transition: {
                duration: running && phase === "focus" ? 1 : 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <>
            <section className="relative lg:flex-1 flex flex-col items-center py-6 sm:py-12 lg:py-0 gap-4 sm:gap-[4vh] lg:overflow-hidden shrink-0 scroll-smooth z-10 w-full">
                <div className="flex-1 flex flex-col items-center justify-center gap-5 sm:gap-[4vh] w-full max-w-md mx-auto px-4 sm:px-6">

                    <div className={`relative flex p-1.5 sm:p-2 rounded-2xl ${gamePanel}`}>
                        {/* ... tabs ... */}
                        {(Object.entries(PHASES) as [Phase, typeof PHASES[Phase]][]).map(([key, val]) => {
                            const isActive = phase === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => onSwitchPhase(key)}
                                    className="relative px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest z-10 transition-colors"
                                    style={{ color: isActive ? '#fff' : (isDark ? '#888' : '#666') }}
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

                    {/* Timer Arena (Container utama) */}
                    <div ref={timerRef} className="flex justify-center w-full relative">
                        <AnimatePresence mode="wait">
                            {(phase === "short" || phase === "long") && running ? (
                                <motion.div key="breathing"
                                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                                    // SINKRONISASI DIMENSI DI SINI: Samakan class dan style dengan container timer
                                    className="relative flex items-center justify-center select-none"
                                    style={{ width: "min(34vh, 260px)", height: "min(34vh, 260px)" }}>
                                    <BreathingGuide color={current.color} />
                                </motion.div>
                            ) : (
                                <motion.div key="timer"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="relative flex items-center justify-center select-none"
                                    // DIMENSI INI HARUS SAMA DENGAN DI ATAS
                                    style={{ width: "min(34vh, 260px)", height: "min(34vh, 260px)" }}>

                                    <div className={`absolute inset-3 sm:inset-4 rounded-full border-[6px] sm:border-[8px] ${isDark ? 'border-[#1E1E24]' : 'border-[#F1F5F9]'} shadow-inner`} />
                                    <ProgressRing pct={pct} color={current.color} />

                                    <div className="flex flex-col items-center z-10">
                                        <div className="font-extrabold geo-nums tabular-nums leading-none tracking-tighter drop-shadow-md"
                                            style={{ fontSize: "clamp(3rem, 7vh, 5rem)", color: running ? current.color : (isDark ? '#fff' : '#333') }}>
                                            {fmt(timeLeft)}
                                        </div>
                                        <motion.span key={phase} className="font-bold uppercase tracking-[0.2em] opacity-50 text-[9px] sm:text-[10px] mt-1 sm:mt-2 bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full">
                                            Level {(sessionsDone % sessionsUntilLong) + 1}
                                        </motion.span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Menggunakan nilai dinamis untuk prop total */}
                    <SessionDots completed={sessionsDone % sessionsUntilLong} total={sessionsUntilLong} color={current.color} />

                    <div className="flex items-center gap-4 sm:gap-5 mt-1 sm:mt-2">
                        {/* ... controls ... */}
                        <motion.button onClick={onReset}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors ${gameButton}`}
                            whileTap={{ y: 4, boxShadow: "0 0px 0 rgba(0,0,0,0)" }}
                            aria-label={t('reset')}>
                            <RotateCcw size={20} strokeWidth={3} className="sm:w-[22px] sm:h-[22px]" />
                        </motion.button>

                        <motion.button
                            onClick={onPlayPause}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] sm:rounded-[2rem] text-white flex items-center justify-center border-b-[4px] sm:border-b-[6px] border-black/20"
                            style={{ backgroundColor: current.color, boxShadow: `0 6px 0 ${current.color}80` }}
                            whileTap={{ y: 6, boxShadow: `0 0px 0 ${current.color}80`, borderBottomWidth: "0px", marginTop: "4px" }}
                        >
                            <AnimatePresence mode="wait">
                                {running
                                    ? <motion.div key="pause" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                        <Pause size={36} fill="currentColor" className="sm:w-[44px] sm:h-[44px]" />
                                    </motion.div>
                                    : <motion.div key="play" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                                        <Play size={36} fill="currentColor" className="ml-1.5 sm:ml-2 sm:w-[44px] sm:h-[44px]" />
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </motion.button>

                        <motion.button onClick={onSkip}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors ${gameButton}`}
                            whileTap={{ y: 4, boxShadow: "0 0px 0 rgba(0,0,0,0)" }}
                            aria-label={t('skip')}>
                            <SkipForward size={20} strokeWidth={3} className="sm:w-[22px] sm:h-[22px]" />
                        </motion.button>
                    </div>


                    <div className={`w-full grid grid-cols-3 gap-2 sm:gap-3 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mt-2 ${gamePanel}`}>
                        {/* ... stats ... */}
                        <div className="flex flex-col items-center justify-center gap-1">
                            <Star size={14} className="text-yellow-400 mb-0.5 drop-shadow-sm" fill="currentColor" />
                            <span className="text-xl sm:text-2xl font-black geo-nums leading-none">{sessionsDone}</span>
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-50">Streaks</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1 border-x-2 border-dashed" style={{ borderColor: isDark ? '#2A2A35' : '#E2E8F0' }}>
                            <Zap size={14} className="text-blue-400 mb-0.5 drop-shadow-sm" fill="currentColor" />
                            <span className="text-xl sm:text-2xl font-black geo-nums leading-none">{sessionsDone * customFocus}</span>
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-50">EXP (Min)</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                            <Shield size={14} className="text-green-400 mb-0.5 drop-shadow-sm" fill="currentColor" />
                            <span className="text-xl sm:text-2xl font-black geo-nums leading-none">{Math.floor(sessionsDone / sessionsUntilLong)}</span>
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-50">Rewards</span>
                        </div>
                    </div>

                    <button onClick={onResetSession} className="text-[10px] sm:text-xs font-bold opacity-40 hover:opacity-100 transition-all flex items-center gap-2 mt-1 mb-6 lg:mb-0 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full">
                        <RefreshCw size={12} strokeWidth={2.5} />
                        {t('resetAllSessions')}
                    </button>
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