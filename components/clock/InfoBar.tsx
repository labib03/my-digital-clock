import React from 'react';
import { type PrayerTimes, type HijriDate } from "@/lib/prayerService";

interface Props {
    locationStatus: 'loading' | 'error' | 'done';
    location: { city: string; country: string } | null;
    fullDateStr: string;
    hijriDate: HijriDate | null;
    prayerTimes: PrayerTimes | null;
    setIsSettingsOpen: (val: boolean) => void;
    theme: any;
}

export const InfoBar: React.FC<Props> = ({
    locationStatus, location, fullDateStr, hijriDate, prayerTimes, setIsSettingsOpen, theme
}) => {
    return (
        <div className="absolute bottom-10 sm:bottom-12 left-0 right-0 flex flex-col sm:grid sm:grid-cols-3 items-center px-4 sm:px-10 lg:px-14 gap-6 sm:gap-4 md:gap-0">
            {/* Col 1: Location — left aligned on desktop, centered on mobile */}
            <div className="flex items-center justify-center sm:justify-start gap-1.5 order-2 sm:order-1 scale-90 sm:scale-100">
                {locationStatus === 'loading' ? (
                    <div className={`flex items-center gap-2 ${theme.textMuted}`}>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                        <span className="text-xs sm:text-sm font-medium">Detecting location...</span>
                    </div>
                ) : locationStatus === 'error' ? (
                    <div className={`flex items-center gap-1.5 ${theme.textMuted}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span className="text-xs sm:text-sm font-medium">Location unavailable</span>
                    </div>
                ) : (
                    <div className={`flex items-center gap-1.5 font-medium text-xs sm:text-sm ${theme.textMuted}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span className="opacity-90">{location?.city}, {location?.country}</span>
                    </div>
                )}
            </div>

            {/* Col 2: Date & Sunrise/Sunset — centered */}
            <div className={`text-center flex flex-col items-center gap-2 ${theme.textMuted} order-1 sm:order-2`}>
                <div className="flex flex-col gap-0">
                    <div className={`font-bold text-sm sm:text-base tracking-tight ${theme.text} opacity-90`}>{fullDateStr}</div>
                    {hijriDate && (
                        <div className="text-[10px] sm:text-[11px] font-medium opacity-40 uppercase tracking-[0.15em]">
                            {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
                        </div>
                    )}
                </div>

                {/* Sunrise / Sunset: Clean Ticker Style */}
                {prayerTimes ? (() => {
                    const cleanTime = (t: string) => t.split(' ')[0];
                    return (
                        <div className="flex items-center justify-center gap-4 py-1 px-4 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-amber-500/70"><path d="M12 2v2M5 5l1.5 1.5M2 12h2M5 19l1.5-1.5M12 20v2M19 19l-1.5-1.5M22 12h-2M19 5l-1.5 1.5" /><circle cx="12" cy="12" r="4" /></svg>
                                <span className="geo-nums text-[10px] sm:text-xs font-bold opacity-70">{cleanTime(prayerTimes.Sunrise)}</span>
                            </div>
                            <div className="w-[1px] h-2 bg-current opacity-10" />
                            <div className="flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange-500/70"><path d="M12 10V2M5 19l1.5-1.5M2 12h2M12 22v-2M19 19l-1.5-1.5M22 12h-2" /><circle cx="12" cy="12" r="4" /></svg>
                                <span className="geo-nums text-[10px] sm:text-xs font-bold opacity-70">{cleanTime(prayerTimes.Maghrib)}</span>
                            </div>
                        </div>
                    );
                })() : null}
            </div>

            {/* Col 3: Configuration Toggles (Settings Button) */}
            <div className="flex flex-row justify-center sm:justify-end items-center order-3 sm:scale-100">
                <button onClick={() => setIsSettingsOpen(true)}
                    className={`p-2.5 sm:p-3 rounded-full transition cursor-pointer ${theme.toggleBg} border border-black/5 dark:border-white/5 hover:opacity-100 active:scale-95 shadow-sm group`}
                    aria-label="Clock Settings" title="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="sm:w-5 sm:h-5 transition-transform duration-500 group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
            </div>
        </div>
    );
};
