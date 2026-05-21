"use client";

import TaskList from "./TaskList";
import LofiPlayer from "./LofiPlayer";
import { useLanguage } from "@/components/shared/LanguageContext";
import { Scroll } from "lucide-react";
import { usePomodoroStore } from "../_store/usePomodoroStore";
import { PHASES } from "./types";

export default function TaskPanel() {
    const { t } = useLanguage();
    
    const {
        isDark, phase, customFocus, shortBreakDuration, longBreakDuration, sessionsUntilLong
    } = usePomodoroStore();
    
    const accentColor = PHASES[phase].color;

    // Panel Wrapper bergaya Quest Board (Neo-Brutalism)
    const questBoard = isDark
        ? "bg-[#1A1A20] border-l-0 lg:border-l-[4px] border-[#0F0F13]"
        : "bg-[#F8FAFC] border-l-0 lg:border-l-[4px] border-[#E2E8F0]";

    return (
        <section className={`w-full lg:w-[40vw] xl:w-[35vw] flex-shrink-0 flex flex-col lg:overflow-y-auto z-10 ${questBoard} transition-colors duration-500`}>
            <div className="flex flex-col px-4 sm:px-8 lg:px-8 pt-4 lg:pt-8 pb-32 lg:pb-8 gap-6 h-full">

                {/* Visual Separator untuk Mobile */}
                <div className="w-full flex justify-center mb-0 lg:hidden">
                    <div className={`w-12 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                </div>

                <div className="flex-1 flex flex-col gap-5 sm:gap-6">
                    {/* Header Quest BoardAla Game */}
                    <div className="hidden lg:flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border-2 border-black/10 dark:border-white/10 border-dashed">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-[0_4px_0_rgba(0,0,0,0.2)]" style={{ backgroundColor: accentColor }}>
                            <Scroll size={24} fill="currentColor" className="text-black/20" />
                        </div>
                        <div>
                            <h2 className="font-black text-sm sm:text-base uppercase tracking-wider opacity-80">Mission Board</h2>
                            <p className="text-[10px] sm:text-xs font-bold opacity-40">Complete daily quests for EXP</p>
                        </div>
                    </div>

                    <LofiPlayer isDark={isDark} accentColor={accentColor} />
                    <TaskList />

                </div>

                <p className="text-[9px] sm:text-[10px] font-bold opacity-40 text-center leading-relaxed mt-4 pb-5 uppercase tracking-wider">
                    {customFocus}m {t('focus')} • {shortBreakDuration}m {t('shortBreak')} • {longBreakDuration}m {t('longBreak')} (Every {sessionsUntilLong} Lvls)
                </p>
            </div>
        </section>
    );
}