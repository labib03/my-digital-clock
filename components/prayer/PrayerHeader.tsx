import React from 'react';
import { type PrayerTimes, type HijriDate, getNextPrayer } from "@/lib/prayerService";
import { useLanguage } from '../shared/LanguageContext';

interface Props {
    hijriDate: HijriDate | null;
    prayerTimes: PrayerTimes | null;
    isDark: boolean;
    theme: any;
    time: Date;
}

export const PrayerHeader: React.FC<Props> = ({ hijriDate, prayerTimes, isDark, theme, time }) => {
    const { t } = useLanguage();
    return (
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end mb-8 md:mb-6 gap-4 md:gap-0">
            {/* Left Side: Hijri Month + Days to Ramadan */}
            {hijriDate ? (
                <div className={`flex flex-col gap-1.5 md:gap-1 text-sm font-medium ${theme.textMuted} p-5 md:p-0 rounded-[1.5rem] md:rounded-none border md:border-none shadow-sm md:shadow-none ${isDark ? 'bg-[#1A1A1A] md:bg-transparent border-[#2A2A2A]' : 'bg-white/50 md:bg-transparent border-black/5'}`}>
                    <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-60 font-bold mb-1">{t('islamicCalendar')}</span>
                    <span className={`text-base font-semibold ${theme.text}`}>
                        <span style={{ fontFamily: 'serif' }}>{hijriDate.month.ar}</span> {hijriDate.year} AH
                    </span>
                    {(() => {
                        const currentMonth = hijriDate.month.number;
                        const currentDay = parseInt(hijriDate.day);
                        const daysInMonths = [0, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
                        if (currentMonth < 9) {
                            let days = daysInMonths[currentMonth] - currentDay;
                            for (let m = currentMonth + 1; m < 9; m++) days += daysInMonths[m];
                            return <span className="text-xs opacity-70 mt-1">✦ {t('daysToRamadan').replace('{0}', (days + 1).toString())}</span>;
                        } else if (currentMonth === 9) {
                            return <span className="text-xs text-amber-500 font-bold mt-1">🌙 {t('ramadanMubarak')}</span>;
                        }
                        return null;
                    })()}
                </div>
            ) : <div />}

            {/* Next Prayer Countdown */}
            {prayerTimes && (() => {
                const nextKey = getNextPrayer(prayerTimes);
                const [nh, nm] = prayerTimes[nextKey].split(':').map(Number);
                const now = time || new Date();
                const totalSecsLeft = ((nh * 60 + nm) - (now.getHours() * 60 + now.getMinutes())) * 60 - now.getSeconds();
                const secsLeft = totalSecsLeft > 0 ? totalSecsLeft : totalSecsLeft + 86400;
                const hrs = Math.floor(secsLeft / 3600), mins = Math.floor((secsLeft % 3600) / 60), secs = secsLeft % 60;
                const fmt = (n: number) => String(n).padStart(2, '0');
                const prayerLabel: Record<string, string> = {
                    Fajr: t('fajr'),
                    Sunrise: t('sunrise'),
                    Dhuhr: t('dhuhr'),
                    Asr: t('asr'),
                    Maghrib: t('maghrib'),
                    Isha: t('isha')
                };
                return (
                    <div className={`flex flex-col items-start md:items-end gap-1.5 md:gap-1 text-left md:text-right p-5 md:p-0 rounded-[1.5rem] md:rounded-none border md:border-none shadow-sm md:shadow-none ${isDark ? 'bg-[#1A1A1A] md:bg-transparent border-[#2A2A2A]' : 'bg-white/50 md:bg-transparent border-black/5'}`}>
                        <span className={`text-[10px] sm:text-xs uppercase tracking-widest opacity-60 font-bold mb-1 ${theme.textMuted}`}>{t('nextPrayer')}</span>
                        <div className={`flex items-baseline gap-2 ${theme.text}`}>
                            <span className="text-base font-semibold" style={{ fontFamily: 'serif' }}>{prayerLabel[nextKey]}</span>
                            <span className="text-sm font-medium opacity-60">{nextKey}</span>
                        </div>
                        <span className={`text-2xl font-semibold geo-nums tracking-tight ${theme.text}`} style={{ letterSpacing: '-0.03em' }}>
                            {hrs > 0 ? `${fmt(hrs)}:` : ''}{fmt(mins)}:{fmt(secs)}
                        </span>
                        <span className={`text-xs ${theme.textMuted} opacity-50 font-medium`}>{t('remaining')}</span>
                    </div>
                );
            })()}
        </div>
    );
};
