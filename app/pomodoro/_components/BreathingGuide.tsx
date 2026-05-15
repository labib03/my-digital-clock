"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BREATHING, BREATHING_CYCLE, type BreathPhase } from "./types";
import { useLanguage } from "@/components/shared/LanguageContext";

interface BreathingGuideProps {
    color: string;
}

export default function BreathingGuide({ color }: BreathingGuideProps) {
    const { t } = useLanguage();

    const [seconds, setSeconds] = useState(0);
    const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
    const [remainingPhase, setRemainingPhase] = useState(BREATHING.inhale);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(prev => {
                const next = prev + 1;
                const cycleTime = next % BREATHING_CYCLE;

                let currentPhase: BreathPhase;
                let timeLeftInPhase: number;

                if (cycleTime < BREATHING.inhale) {
                    currentPhase = "inhale";
                    timeLeftInPhase = BREATHING.inhale - cycleTime;
                } else if (cycleTime < BREATHING.inhale + BREATHING.hold) {
                    currentPhase = "hold";
                    timeLeftInPhase = (BREATHING.inhale + BREATHING.hold) - cycleTime;
                } else {
                    currentPhase = "exhale";
                    timeLeftInPhase = BREATHING_CYCLE - cycleTime;
                }

                setBreathPhase(currentPhase);
                setRemainingPhase(timeLeftInPhase);

                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const getPhaseDuration = (p: BreathPhase) => BREATHING[p];
    const elapsedInPhase = getPhaseDuration(breathPhase) - remainingPhase;
    const pct = elapsedInPhase / getPhaseDuration(breathPhase);

    const strokeDasharray = 2 * Math.PI * 90;
    const strokeDashoffset = strokeDasharray * (1 - pct);

    const getPhaseLabel = (p: BreathPhase) => {
        if (p === "inhale") return t('inhale');
        if (p === "hold") return t('hold');
        if (p === "exhale") return t('exhale');
        return "";
    };

    const petPulse = {
        animate: {
            scale: breathPhase === "inhale" ? 1.1 : breathPhase === "exhale" ? 0.9 : 1.0,
            transition: {
                duration: getPhaseDuration(breathPhase),
                ease: "linear"
            }
        }
    };

    return (
        // Root div dilepas dimensi internalnya, parent TimerSection yang mengaturnya.
        <div className="relative w-full h-full flex items-center justify-center select-none">

            <div className="absolute inset-2 sm:inset-3 rounded-full border-[6px] sm:border-[8px] border-black/10 dark:border-white/10 shadow-inner" />

            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <motion.circle cx="100" cy="100" r="90" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                    style={{ strokeDasharray, strokeDashoffset }}
                    transition={{ duration: 1, ease: "linear" }} />
            </svg>

            <div className="flex flex-col items-center justify-center z-10 mt-1">

                {/* Wrapper Div khusus untuk Angka agar posisinya stabil */}
                <div className="relative flex justify-center items-center h-[1.2em]">
                    {/* HAPUS mode="wait" DI SINI agar layout stabil */}
                    <AnimatePresence>
                        <motion.div
                            key={remainingPhase}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            // Saat exit dibuat absolute agar tidak mendorong layout, dan angka baru langsung mengambil tempatnya
                            exit={{ opacity: 0, scale: 1.5, position: "absolute" }}
                            transition={{ duration: 0.3 }}
                            className="font-black geo-nums tabular-nums leading-none tracking-tighter"
                            style={{ fontSize: "clamp(2.5rem, 6vh, 4rem)", color: color }}
                        >
                            {remainingPhase}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Wrapper Div khusus untuk Label Fase agar teks bawahnya tidak naik turun */}
                <div className="relative flex justify-center items-center h-[20px] mt-8">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={breathPhase}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5, position: "absolute" }}
                            className="font-bold uppercase tracking-[0.2em] opacity-60 text-[9px] sm:text-[10px] bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full text-center"
                        >
                            {getPhaseLabel(breathPhase)}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}