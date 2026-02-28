"use client";

import TaskList from "./TaskList";
import LofiPlayer from "./LofiPlayer";
import { SESSIONS_UNTIL_LONG } from "./types";
import { useLanguage } from "@/components/shared/LanguageContext";

// ─── TaskPanel ────────────────────────────────────────────────────────────────

interface TaskPanelProps {
    isDark: boolean;
    accentColor: string;
    customFocus: number;
}

export default function TaskPanel({ isDark, accentColor, customFocus }: TaskPanelProps) {
    const { t } = useLanguage();
    return (
        <section className="w-full lg:w-[40vw] xl:w-[35vw] flex-shrink-0 flex flex-col overflow-y-auto px-6 sm:px-10 lg:px-8 pt-8 pb-8 gap-4">
            <LofiPlayer isDark={isDark} accentColor={accentColor} />
            <TaskList isDark={isDark} accentColor={accentColor} />
            <p className="text-[10px] opacity-40 text-center leading-relaxed">
                {customFocus}m {t('focus')} · 5m {t('shortBreak')} · 15m {t('longBreak')} every {SESSIONS_UNTIL_LONG} sessions
            </p>
        </section>
    );
}
