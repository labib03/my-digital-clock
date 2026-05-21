"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SoundOption } from "./types";
import { useLanguage } from "@/components/shared/LanguageContext";
import { ChevronsUpIcon } from "lucide-react";
import { usePomodoroStore } from "../_store/usePomodoroStore";
import { PHASES } from "./types";

interface SettingsPanelProps {
    cardBg: string;
}

export default function SettingsPanel({ cardBg }: SettingsPanelProps) {
    const { t, language, setLanguage } = useLanguage();
    
    const { 
        showSettings, setShowSettings, isDark, phase,
        customFocus, setCustomFocus,
        shortBreakDuration, setShortBreakDuration,
        longBreakDuration, setLongBreakDuration,
        sessionsUntilLong, setSessionsUntilLong,
        sound, setSound
    } = usePomodoroStore();
    
    const accentColor = PHASES[phase].color;

    const controlBtn = `w-8 h-8 rounded-full border ${cardBg} text-base font-bold cursor-pointer flex items-center justify-center hover:opacity-80 transition active:scale-90`;

    return (
        <AnimatePresence>
            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex-shrink-0 z-10 overflow-hidden border-b backdrop-blur-sm"
                    style={{
                        borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                        backgroundColor: isDark ? "rgba(10,10,10,1)" : "rgba(242,243,245,1)"
                    }}>

                    <div className="px-6 md:px-10 lg:px-0">
                        <div className={`rounded-xl border ${cardBg} p-5 my-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl mx-auto`}>

                            {/* Focus Duration */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold">{t('focusDuration')}</p>
                                    <p className="text-xs opacity-40">{t('focusDurationDesc')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCustomFocus(Math.max(5, customFocus - 5))} className={controlBtn}>−</button>
                                    <span className="text-base font-bold w-12 text-center geo-nums">{customFocus} <span className="text-[10px] opacity-50 font-normal">min</span></span>
                                    <button onClick={() => setCustomFocus(Math.min(90, customFocus + 5))} className={controlBtn}>+</button>
                                </div>
                            </div>

                            {/* Short Break Duration */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold">{t('shortBreakDuration') || 'Short Break'}</p>
                                    <p className="text-xs opacity-40">{t('shortBreakDurationDesc')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShortBreakDuration(Math.max(1, shortBreakDuration - 1))} className={controlBtn}>−</button>
                                    <span className="text-base font-bold w-12 text-center geo-nums">{shortBreakDuration} <span className="text-[10px] opacity-50 font-normal">min</span></span>
                                    <button onClick={() => setShortBreakDuration(Math.min(30, shortBreakDuration + 5))} className={controlBtn}>+</button>
                                </div>
                            </div>

                            {/* Long Break Duration */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold">{t('longBreakDuration') || 'Long Break Duration'}</p>
                                    <p className="text-xs opacity-40">{t('longBreakDurationDesc') || 'Duration for long break'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setLongBreakDuration(Math.max(5, longBreakDuration - 5))} className={controlBtn}>−</button>
                                    <span className="text-base font-bold w-12 text-center geo-nums">{longBreakDuration} <span className="text-[10px] opacity-50 font-normal">min</span></span>
                                    <button onClick={() => setLongBreakDuration(Math.min(60, longBreakDuration + 5))} className={controlBtn}>+</button>
                                </div>
                            </div>

                            {/* Sessions Until Long Break */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold">{t('sessionsUntilLong')}</p>
                                    <p className="text-xs opacity-40">{t('sessionsUntilLongDesc')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setSessionsUntilLong(Math.max(2, sessionsUntilLong - 1))} className={controlBtn}>−</button>
                                    <span className="text-base font-bold w-12 text-center geo-nums">{sessionsUntilLong} <span className="text-[10px] opacity-50 font-normal">ses</span></span>
                                    <button onClick={() => setSessionsUntilLong(Math.min(10, sessionsUntilLong + 1))} className={controlBtn}>+</button>
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
                                        <button key={opt} onClick={() => setSound(opt)}
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
                    </div>

                    <div className="w-full mt-4 mb-2 border-t pt-2" style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                        <button type="button" className="flex items-center justify-center font-semibold py-1.5 cursor-pointer w-full" onClick={() => setShowSettings(false)}><span><ChevronsUpIcon className="w-5 h-5 mr-2" /></span>{t('closeSettings')}</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}