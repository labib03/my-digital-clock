"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Phase, SoundOption } from "./types";
import { PHASES } from "./types";

// ─── SettingsPanel ────────────────────────────────────────────────────────────

interface SettingsPanelProps {
    show: boolean;
    isDark: boolean;
    cardBg: string;
    customFocus: number;
    sound: SoundOption;
    accentColor: string;
    onFocusChange: (val: number) => void;
    onSoundChange: (val: SoundOption) => void;
}

export default function SettingsPanel({
    show, isDark, cardBg, customFocus, sound, accentColor,
    onFocusChange, onSoundChange,
}: SettingsPanelProps) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex-shrink-0 z-10 overflow-hidden px-6 sm:px-10 border-b"
                    style={{ borderColor: isDark ? "#2A2A2A" : "#E5E7EB" }}>

                    <div className={`rounded-xl border ${cardBg} p-4 my-3 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto`}>

                        {/* Focus Duration */}
                        <div className="flex items-center justify-between gap-4 flex-1">
                            <div>
                                <p className="text-sm font-semibold">Focus Duration</p>
                                <p className="text-xs opacity-40">minutes per session</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onFocusChange(Math.max(5, customFocus - 5))}
                                    className={`w-8 h-8 rounded-full border ${cardBg} text-base font-bold cursor-pointer flex items-center justify-center hover:opacity-80 transition`}>
                                    −
                                </button>
                                <span className="text-base font-bold w-8 text-center geo-nums">{customFocus}</span>
                                <button onClick={() => onFocusChange(Math.min(90, customFocus + 5))}
                                    className={`w-8 h-8 rounded-full border ${cardBg} text-base font-bold cursor-pointer flex items-center justify-center hover:opacity-80 transition`}>
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Ambient Sound */}
                        <div className="flex items-center justify-between gap-4 flex-1">
                            <div>
                                <p className="text-sm font-semibold">Ambient Sound</p>
                                <p className="text-xs opacity-40">plays during focus sessions</p>
                            </div>
                            <div className={`flex rounded-full p-1 gap-1 border ${cardBg} text-[9px] uppercase tracking-widest font-bold`}>
                                {(["off", "white", "brown"] as const).map(opt => (
                                    <button key={opt} onClick={() => onSoundChange(opt)}
                                        className={`px-2.5 py-1.5 rounded-full cursor-pointer transition ${sound === opt ? "text-white shadow-md" : "opacity-40 hover:opacity-70"}`}
                                        style={sound === opt ? { backgroundColor: accentColor } : {}}>
                                        {opt === "off" ? "Off" : opt === "white" ? "White" : "Brown"}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
