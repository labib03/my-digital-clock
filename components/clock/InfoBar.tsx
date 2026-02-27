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
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        <span className="opacity-90">{location?.city}, {location?.country}</span>
                    </div>
                )}
            </div>

            {/* Col 2: Date & Sunrise/Sunset — centered */}
            <div className={`text-center flex flex-col items-center gap-1 sm:gap-1.5 ${theme.textMuted} order-1 sm:order-2`}>
                <div className="flex flex-col gap-0.5">
                    <div className="font-medium text-xs sm:text-sm tracking-wide opacity-80">{fullDateStr}</div>
                    {hijriDate && (
                        <div className="text-[10px] sm:text-xs font-semibold opacity-50">
                            <span style={{ fontFamily: 'serif' }}>{hijriDate.day} {hijriDate.month.ar}</span>
                            {' '}·{' '}{hijriDate.month.en} {hijriDate.year} AH
                        </div>
                    )}
                </div>
                {/* Sunrise / Sunset incorporated in the center */}
                {prayerTimes ? (() => {
                    const cleanTime = (t: string) => t.split(' ')[0];
                    return (
                        <div className={`font-semibold flex items-center justify-center gap-2 ${theme.textMuted}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 flex-shrink-0"><path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 6l-4-4-4 4M12 6v6" /></svg>
                            <span className="geo-nums text-[10px] sm:text-xs opacity-80">{cleanTime(prayerTimes.Sunrise)}</span>
                            <span className="opacity-30 mx-0.5" style={{ fontSize: '10px' }}>—</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400 flex-shrink-0"><path d="M12 10v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 18l-4 4-4-4M12 18V12" /></svg>
                            <span className="geo-nums text-[10px] sm:text-xs opacity-80">{cleanTime(prayerTimes.Maghrib)}</span>
                        </div>
                    );
                })() : null}
            </div>

            {/* Col 3: Configuration Toggles (Settings Button) */}
            <div className="flex flex-row justify-center sm:justify-end items-center order-3 sm:scale-100">
                <button onClick={() => setIsSettingsOpen(true)}
                    className={`p-2 sm:p-2.5 rounded-full transition cursor-pointer ${theme.toggleBg} hover:opacity-80 active:scale-95`}
                    aria-label="Clock Settings" title="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
            </div>
        </div>
    );
};
