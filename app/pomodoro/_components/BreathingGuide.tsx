"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BREATHING, BREATHING_CYCLE, type BreathPhase } from "./types";

// ─── BreathingGuide ───────────────────────────────────────────────────────────

interface BreathingGuideProps {
    color: string;
}

export default function BreathingGuide({ color }: BreathingGuideProps) {
    const [tick, setTick] = useState(0);
    const [breathPhase, setBreathPhase] = useState<BreathPhase>("inhale");
    const [label, setLabel] = useState("Breathe in...");
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const pos = tick % BREATHING_CYCLE;
        if (pos < BREATHING.inhale) {
            setBreathPhase("inhale"); setLabel("Breathe in..."); setScale(1);
        } else if (pos < BREATHING.inhale + BREATHING.hold) {
            setBreathPhase("hold"); setLabel("Hold...");
        } else {
            setBreathPhase("exhale"); setLabel("Breathe out..."); setScale(0.5);
        }
    }, [tick]);

    const dur = breathPhase === "inhale" ? BREATHING.inhale
        : breathPhase === "hold" ? BREATHING.hold
            : BREATHING.exhale;

    return (
        <motion.div className="flex flex-col items-center gap-6 py-4 select-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs uppercase tracking-[0.3em] opacity-40 font-bold">Short Break · Breathe</p>
            <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                <motion.div className="absolute rounded-full opacity-20"
                    style={{ backgroundColor: color, width: 200, height: 200 }}
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: BREATHING_CYCLE, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div className="rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color + "33", border: `2px solid ${color}66`, width: 120, height: 120 }}
                    animate={{ scale }}
                    transition={{ duration: dur, ease: breathPhase === "exhale" ? "easeIn" : "easeOut" }}>
                    <motion.div className="rounded-full" style={{ backgroundColor: color, width: 24, height: 24 }}
                        animate={{ scale: breathPhase === "hold" ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 1, repeat: breathPhase === "hold" ? Infinity : 0 }}
                    />
                </motion.div>
            </div>
            <p className="text-lg font-semibold opacity-70">{label}</p>
            <p className="text-xs opacity-30">{BREATHING.inhale}s in · {BREATHING.hold}s hold · {BREATHING.exhale}s out</p>
        </motion.div>
    );
}
