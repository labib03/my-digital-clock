"use client";

import { useState, useEffect } from "react";
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

    return (
        <div className="flex flex-col items-center justify-center gap-8 select-none">

            {/* Circular Indicator */}
            <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
                {/* Thick background track */}
                <div className="absolute inset-0 rounded-full border-[12px] sm:border-[16px] border-black/5 dark:border-white/5" />
                
                {/* Animated progress ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 200 200">
                    <motion.circle 
                        cx="100" cy="100" r="86" 
                        fill="none" 
                        stroke={color} 
                        strokeWidth="16" 
                        strokeLinecap="round"
                        style={{ strokeDasharray, strokeDashoffset }}
                        transition={{ duration: 1, ease: "linear" }} 
                    />
                </svg>

                {/* Animated Number inside the circle */}
                <div className="relative flex justify-center items-center">
                    <AnimatePresence>
                        <motion.div
                            key={remainingPhase}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5, position: "absolute" }}
                            transition={{ duration: 0.3 }}
                            className="font-black geo-nums tabular-nums leading-none tracking-tighter"
                            style={{ fontSize: "clamp(4rem, 8vh, 6rem)", color: color }}
                        >
                            {remainingPhase}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Phase Label Pill outside the circle */}
            <div className="h-[40px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={breathPhase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, position: "absolute" }}
                        className="font-black uppercase tracking-[0.3em] text-xs sm:text-sm px-6 py-3 rounded-full text-center shadow-sm"
                        style={{ backgroundColor: `${color}20`, color: color }}
                    >
                        {getPhaseLabel(breathPhase)}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    );
}