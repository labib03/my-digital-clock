"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Play, Pause, RotateCcw, SkipForward, Star, Shield, Zap, RefreshCcw } from "lucide-react";

import { PHASES, type Phase } from "./types";
import ProgressRing from "./ProgressRing";
import BreathingGuide from "./BreathingGuide";
import MiniTimerPlayer from "./MiniTimerPlayer";
import { useLanguage } from "@/components/shared/LanguageContext";
import { usePomodoroStore } from "../_store/usePomodoroStore";

interface TimerSectionProps {
    onPlayPause: () => void;
    onSkip: () => void;
    onReset: () => void;
    onResetSession: () => void;
}

function clampIconSize(min: number, max: number) {
    if (typeof window !== "undefined") {
        const vw = window.innerWidth;
        if (vw < 640) return min;
        return max;
    }
    return min;
}

export default function TimerSection({
    onPlayPause, onSkip, onReset, onResetSession
}: TimerSectionProps) {
    const { t } = useLanguage();
    
    // Get everything from store!
    const {
        isDark, phase, timeLeft, running, sessionsDone,
        customFocus, sessionsUntilLong, activeTaskName,
        setPhase
    } = usePomodoroStore();

    const current = PHASES[phase];

    let totalTime = customFocus * 60;
    if (phase === "short") totalTime = usePomodoroStore.getState().shortBreakDuration * 60;
    if (phase === "long") totalTime = usePomodoroStore.getState().longBreakDuration * 60;
    const pct = timeLeft / totalTime;

    const fmt = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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

    const textCol = isDark ? '#fff' : '#111827';

    return (
        <>
            <section className="relative lg:flex-1 flex flex-col items-center py-4 lg:py-6 lg:overflow-hidden shrink-0 scroll-smooth z-10 w-full">
                <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-5 w-full max-w-lg lg:max-w-3xl mx-auto px-4">
                    
                    {/* 1. DYNAMIC TABS BLOCK */}
                    <div className={`relative flex p-1.5 sm:p-2 rounded-2xl w-fit mx-auto ${gamePanel}`}>
                        {(Object.entries(PHASES) as [Phase, typeof PHASES[Phase]][]).map(([key, val]) => {
                            const isActive = phase === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => {
                                        if (!running) setPhase(key as Phase);
                                    }}
                                    disabled={running}
                                    className={`relative px-3 sm:px-6 py-1.5 sm:py-2 rounded-xl font-bold uppercase tracking-widest z-10 transition-colors text-[9px] sm:text-xs ${running ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    style={{ color: isActive ? '#fff' : (isDark ? '#888' : '#666'), opacity: (running && !isActive) ? 0.3 : 1 }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-tab"
                                            className="absolute inset-0 rounded-xl -z-10 shadow-sm"
                                            style={{ backgroundColor: val.color }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    {getPhaseLabel(key as Phase)}
                                </button>
                            );
                        })}
                    </div>

                    {/* 2. BENTO GRID */}
                    <div ref={timerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full mt-2">
                        
                        {/* LEFT: VISUAL ARENA */}
                        <div className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-[2rem] ${gamePanel} h-full min-h-[320px]`}>
                            <AnimatePresence mode="wait">
                                {(phase === "short" || phase === "long") && running ? (
                                    <motion.div key="breathing"
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                        className="flex flex-col items-center justify-center gap-6 w-full h-full"
                                    >
                                        <BreathingGuide color={current.color} />
                                        <div className="flex flex-col items-center">
                                            <div className="font-extrabold geo-nums tabular-nums leading-none tracking-tighter opacity-50"
                                                style={{ fontSize: "clamp(2rem, 5vmin, 3rem)", color: textCol }}>
                                                {fmt(timeLeft)}
                                            </div>
                                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] opacity-40 mt-1">
                                                {phase === "short" ? "Short Break" : "Long Break"} Left
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="timer"
                                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                                        className="relative flex flex-col items-center justify-center w-full h-full"
                                    >
                                        <div style={{ width: "clamp(180px, 30vmin, 240px)", height: "clamp(180px, 30vmin, 240px)" }} className="relative flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full border-[clamp(6px,2vmin,12px)] border-black/5 dark:border-white/5" />
                                            <ProgressRing pct={pct} color={current.color} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none drop-shadow-sm">
                                                <div className="font-extrabold geo-nums tabular-nums leading-none tracking-tighter"
                                                    style={{ fontSize: "clamp(3.5rem, 8vmin, 5rem)", color: textCol, textShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                                    {fmt(timeLeft)}
                                                </div>
                                                <motion.span key={phase} className="font-bold uppercase tracking-widest opacity-40 text-[10px] sm:text-xs mt-2">
                                                    Level {(sessionsDone % sessionsUntilLong) + 1}
                                                </motion.span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* SESSION DOTS */}
                            <div className="flex justify-center gap-2.5 mt-auto pt-8">
                                {Array.from({ length: sessionsUntilLong }).map((_, i) => {
                                    const cycleDone = sessionsDone % sessionsUntilLong;
                                    const active = i < cycleDone;
                                    const currentSession = i === cycleDone && phase === "focus" && running;
                                    return (
                                        <div key={i} className="relative w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: active ? PHASES.focus.color : isDark ? '#333' : '#E2E8F0' }}>
                                            {currentSession && (
                                                <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: PHASES.focus.color }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* RIGHT: INFO, CONTROLS, STATS */}
                        <div className="flex flex-col gap-4 sm:gap-5 h-full">
                            
                            {/* ACTIVE TASK CARD */}
                            <div className={`flex flex-col justify-center p-5 sm:p-6 rounded-[2rem] ${gamePanel}`}>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2">
                                    Current Quest
                                </p>
                                <div className="min-h-[44px] sm:min-h-[48px] flex items-center">
                                    {activeTaskName ? (
                                        <div className="font-bold text-sm sm:text-base leading-snug break-words flex items-start gap-3 w-full">
                                            <span className="w-3 h-3 rounded-full shrink-0 mt-1.5 animate-pulse" style={{ backgroundColor: current.color }}></span>
                                            <span className="line-clamp-2">{activeTaskName}</span>
                                        </div>
                                    ) : (
                                        <div className="font-bold text-sm opacity-30 italic">
                                            No active quest selected.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* CONTROLS CARD */}
                            <div className={`flex items-center justify-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-[2rem] ${gamePanel} flex-1`}>
                                <button
                                    onClick={onReset}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${gameButton}`}
                                    aria-label="Reset Timer"
                                >
                                    <RotateCcw size={20} strokeWidth={2.5} className="opacity-70" />
                                </button>
                                
                                <button
                                    onClick={onPlayPause}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all active:scale-95 shadow-lg relative group overflow-hidden"
                                    style={{ backgroundColor: current.color }}
                                    aria-label={running ? "Pause Timer" : "Start Timer"}
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-200" />
                                    <div className="relative z-10 text-white drop-shadow-md">
                                        {running ? <Pause className="w-7 h-7 sm:w-9 sm:h-9" fill="currentColor" /> : <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1" fill="currentColor" />}
                                    </div>
                                </button>
                                
                                <button
                                    onClick={onSkip}
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform active:scale-90 ${gameButton}`}
                                    aria-label="Skip Phase"
                                >
                                    <SkipForward size={20} strokeWidth={2.5} className="opacity-70" />
                                </button>
                            </div>

                            {/* STATS CARD */}
                            <div className={`flex items-center justify-around px-4 py-5 sm:p-6 rounded-[2rem] ${gamePanel}`}>
                                <div className="flex flex-col items-center">
                                    <Star size={20} className="text-yellow-400 mb-2 drop-shadow-sm" fill="currentColor" />
                                    <span className="font-extrabold text-xl leading-none geo-nums">{sessionsDone}</span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1.5">Streaks</span>
                                </div>
                                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <Zap size={20} className="text-blue-500 mb-2 drop-shadow-sm" fill="currentColor" />
                                    <span className="font-extrabold text-xl leading-none geo-nums">
                                        {Math.floor((sessionsDone * customFocus))}
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1.5">EXP (Min)</span>
                                </div>
                                <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                <div className="flex flex-col items-center relative group">
                                    <button
                                        onClick={onResetSession}
                                        className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-red-500 text-white rounded-full hover:scale-110 shadow-sm"
                                        aria-label="Reset All Sessions"
                                    >
                                        <RefreshCcw size={12} strokeWidth={3} />
                                    </button>
                                    <Shield size={20} className="text-green-500 mb-2 drop-shadow-sm" fill="currentColor" />
                                    <span className="font-extrabold text-xl leading-none geo-nums">
                                        {Math.floor(sessionsDone / sessionsUntilLong)}
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1.5">Rewards</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            <AnimatePresence>
                {!timerInView && (
                    <MiniTimerPlayer onPlayPause={onPlayPause} onSkip={onSkip} />
                )}
            </AnimatePresence>
        </>
    );
}