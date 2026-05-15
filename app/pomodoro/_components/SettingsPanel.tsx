"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SoundOption } from "./types";
import { useLanguage } from "@/components/shared/LanguageContext";

// ─── SettingsPanel ────────────────────────────────────────────────────────────

interface SettingsPanelProps {
    show: boolean;
    isDark: boolean;
    cardBg: string;
    customFocus: number;
    sessionsUntilLong: number;
    longBreakDuration: number;
    sound: SoundOption;
    accentColor: string;
    shortBreakDuration: number;
    onShortBreakDurationChange: (val: number) => void;
    onFocusChange: (val: number) => void;
    onSessionsUntilLongChange: (val: number) => void;
    onLongBreakDurationChange: (val: number) => void;
    onSoundChange: (val: SoundOption) => void;
}

export default function SettingsPanel({
    show, isDark, cardBg, customFocus, sessionsUntilLong, longBreakDuration, sound, accentColor, shortBreakDuration, onShortBreakDurationChange,
    onFocusChange, onSessionsUntilLongChange, onLongBreakDurationChange, onSoundChange,
}: SettingsPanelProps) {
    const { t, language, setLanguage } = useLanguage();

    const controlBtn = `w-8 h-8 rounded-full border ${cardBg} text-base font-bold cursor-pointer flex items-center justify-center hover:opacity-80 transition active:scale-90`;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex-shrink-0 z-10 overflow-hidden px-6 sm:px-10 border-b backdrop-blur-sm"
                    style={{
                        borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                        backgroundColor: isDark ? "rgba(10,10,10,1)" : "rgba(242,243,245,1)"
                    }}>

                    <div className={`rounded-xl border ${cardBg} p-5 my-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl mx-auto`}>

                        {/* Focus Duration */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold">{t('focusDuration')}</p>
                                <p className="text-xs opacity-40">{t('focusDurationDesc')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onFocusChange(Math.max(5, customFocus - 5))} className={controlBtn}>−</button>
                                <span className="text-base font-bold w-8 text-center geo-nums">{customFocus}</span>
                                <button onClick={() => onFocusChange(Math.min(90, customFocus + 5))} className={controlBtn}>+</button>
                            </div>
                        </div>

                        {/* Short Break Duration (BARU) */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold">{t('shortBreakDuration') || 'Short Break'}</p>
                                <p className="text-xs opacity-40">Duration in minutes</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onShortBreakDurationChange(Math.max(1, shortBreakDuration - 1))} className={controlBtn}>−</button>
                                <span className="text-base font-bold w-8 text-center geo-nums">{shortBreakDuration}</span>
                                <button onClick={() => onShortBreakDurationChange(Math.min(30, shortBreakDuration + 5))} className={controlBtn}>+</button>
                            </div>
                        </div>

                        {/* Long Break Duration (BARU) */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold">{t('longBreakDuration') || 'Long Break Duration'}</p>
                                <p className="text-xs opacity-40">{t('longBreakDurationDesc') || 'Duration for long break'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onLongBreakDurationChange(Math.max(5, longBreakDuration - 5))} className={controlBtn}>−</button>
                                <span className="text-base font-bold w-8 text-center geo-nums">{longBreakDuration}</span>
                                <button onClick={() => onLongBreakDurationChange(Math.min(60, longBreakDuration + 5))} className={controlBtn}>+</button>
                            </div>
                        </div>

                        {/* Sessions Until Long Break */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold">{t('sessionsUntilLong')}</p>
                                <p className="text-xs opacity-40">{t('sessionsUntilLongDesc')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onSessionsUntilLongChange(Math.max(2, sessionsUntilLong - 1))} className={controlBtn}>−</button>
                                <span className="text-base font-bold w-8 text-center geo-nums">{sessionsUntilLong}</span>
                                <button onClick={() => onSessionsUntilLongChange(Math.min(10, sessionsUntilLong + 1))} className={controlBtn}>+</button>
                            </div>
                        </div>

                        {/* Ambient Sound */}
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold">{t('ambientSound')}</p>
                                <p className="text-xs opacity-40">{t('ambientSoundDesc')}</p>
                            </div>
                            <div className={`flex rounded-full p-1 gap-1 border ${cardBg} text-[9px] uppercase tracking-widest font-bold`}>
                                {(["off", "white", "brown"] as const).map(opt => (
                                    <button key={opt} onClick={() => onSoundChange(opt)}
                                        className={`px-3 py-1.5 rounded-full cursor-pointer transition ${sound === opt ? "text-white shadow-md" : "opacity-40 hover:opacity-70"}`}
                                        style={sound === opt ? { backgroundColor: accentColor } : {}}>
                                        {opt === "off" ? t('soundOff') : opt === "white" ? t('soundWhite') : t('soundBrown')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Language */}
                        <div className="flex items-center justify-between gap-4 md:col-span-2 border-t pt-4 mt-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                            <p className="text-sm font-semibold">{t('language')}</p>
                            <div className={`flex rounded-full p-1 gap-1 border ${cardBg} text-[9px] uppercase tracking-widest font-bold`}>
                                <button onClick={() => setLanguage('en')}
                                    className={`px-4 py-1.5 rounded-full cursor-pointer transition ${language === 'en' ? "text-white shadow-md" : "opacity-40 hover:opacity-70"}`}
                                    style={language === 'en' ? { backgroundColor: accentColor } : {}}>
                                    ENGLISH
                                </button>
                                <button onClick={() => setLanguage('id')}
                                    className={`px-4 py-1.5 rounded-full cursor-pointer transition ${language === 'id' ? "text-white shadow-md" : "opacity-40 hover:opacity-70"}`}
                                    style={language === 'id' ? { backgroundColor: accentColor } : {}}>
                                    INDONESIA
                                </button>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}