"use client";

import TaskList from "./TaskList";
import LofiPlayer from "./LofiPlayer";
import { useLanguage } from "@/components/shared/LanguageContext";
import { Scroll } from "lucide-react";
import { useState } from "react";
import { usePomodoroStore } from "../_store/usePomodoroStore";
import { PHASES } from "./types";

export default function TaskPanel() {
  const { t } = useLanguage();

  const {
    isDark,
    phase,
    customFocus,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLong,
  } = usePomodoroStore();

  const accentColor = PHASES[phase].color;
  const [isLofiExpanded, setIsLofiExpanded] = useState(false);

  // Panel Container: Removed solid questBoard background to make it float seamlessly alongside TimerSection.
  return (
    <section className="relative w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col lg:overflow-hidden z-10 transition-colors duration-500 py-4 lg:py-8 lg:h-full">
      <div className="flex flex-col w-full px-4 sm:px-8 lg:px-0 lg:pr-8 xl:pr-12 pb-32 lg:pb-0 gap-6 lg:gap-8 lg:h-full min-h-0">
        {/* Visual Separator untuk Mobile */}
        <div className="w-full flex justify-center lg:hidden shrink-0">
          <div
            className={`w-12 h-2 rounded-full ${isDark ? "bg-white/10" : "bg-black/10"}`}
          />
        </div>

        <div className="flex-1 flex flex-col gap-5 sm:gap-6 lg:gap-8 min-h-0">
          {/* Header Quest Board Ala Game */}
          <div className="hidden lg:flex items-center gap-4 bg-black/5 dark:bg-white/5 p-4 sm:p-5 lg:p-6 rounded-[2rem] border-2 border-black/10 dark:border-white/10 border-dashed">
            <div
              className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shadow-[0_4px_0_rgba(0,0,0,0.2)] shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              <Scroll
                className="w-6 h-6 lg:w-8 lg:h-8 text-black/20"
                fill="currentColor"
              />
            </div>
            <div>
              <h2 className="font-black text-sm lg:text-lg uppercase tracking-wider opacity-80 leading-tight">
                Mission Board
              </h2>
              <p className="text-[10px] lg:text-xs font-bold opacity-40 mt-1">
                Complete daily quests for EXP
              </p>
            </div>
          </div>

          <LofiPlayer isDark={isDark} accentColor={accentColor} onExpandedChange={setIsLofiExpanded} />
          <TaskList isCollapsed={isLofiExpanded} />
        </div>
      </div>
    </section>
  );
}
