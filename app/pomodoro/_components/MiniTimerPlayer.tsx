"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipForward } from "lucide-react";
import { PHASES, type Phase } from "./types";
import { useLanguage } from "@/components/shared/LanguageContext";

interface MiniTimerPlayerProps {
    phase: Phase;
    timeLeft: number;
    running: boolean;
    isDark: boolean;
    fmt: (s: number) => string;
    onPlayPause: () => void;
    onSkip: () => void;
}

export default function MiniTimerPlayer({
    phase, timeLeft, running, isDark, fmt, onPlayPause, onSkip
}: MiniTimerPlayerProps) {
    const { t } = useLanguage();
    const current = PHASES[phase];

    const getPhaseLabel = (p: Phase) => {
        if (p === "focus") return t('focus');
        if (p === "short") return t('shortBreak');
        if (p === "long") return t('longBreak');
        return "";
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed bottom-6 left-4 right-4 z-50 lg:hidden rounded-2xl shadow-2xl backdrop-blur-xl border ${isDark ? 'bg-[#1A1A1A]/80 border-white/10' : 'bg-white/80 border-black/5'} p-4 flex items-center justify-between`}
        >
            <div className="flex items-center gap-4">
                {/* Progress Indicator Ring Kecil */}
                <div className="relative w-12 h-12 flex items-center justify-center rounded-full" style={{ backgroundColor: `${current.color}20` }}>
                    <div className="absolute inset-1 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${current.color} transparent transparent transparent`, animationDuration: "3s", display: running ? "block" : "none" }} />
                    <span className="text-xs font-bold" style={{ color: current.color }}>
                        {getPhaseLabel(phase).substring(0, 1)}
                    </span>
                </div>

                <div className="flex flex-col">
                    <span className="text-2xl font-bold geo-nums leading-none tracking-tight">
                        {fmt(timeLeft)}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest opacity-50 font-medium">
                        {getPhaseLabel(phase)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onPlayPause}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                    style={{ backgroundColor: current.color }}
                >
                    {running ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>
                <button
                    onClick={onSkip}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-90 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'}`}
                >
                    <SkipForward size={16} className="opacity-70" />
                </button>
            </div>
        </motion.div>
    );
}