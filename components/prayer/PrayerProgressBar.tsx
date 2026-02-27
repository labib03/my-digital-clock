import React from 'react';
import { PrayerTimes, getNextPrayer } from '@/lib/prayerService';

interface Props {
    prayerTimes: PrayerTimes | null;
    time: Date;
    isDark: boolean;
    theme: any;
}

export const PrayerProgressBar: React.FC<Props> = ({ prayerTimes, time, isDark, theme }) => {
    if (!prayerTimes) return null;

    const prayers: (keyof typeof prayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

    // Default to current time if time prop is somehow missing
    const now = time || new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    const dayStart = toMins(prayerTimes['Fajr']);
    const dayEnd = toMins(prayerTimes['Isha']) + 90;

    const progress = Math.max(0, Math.min(1, (nowMins - dayStart) / (dayEnd - dayStart)));
    const nextKey = getNextPrayer(prayerTimes);

    return (
        <div className="mt-8 mb-6 sm:mb-0">
            {/* Top Labels */}
            <div className="relative mb-2 h-8 sm:h-10">
                {prayers.map((key, i) => {
                    const pos = (toMins(prayerTimes[key]) - dayStart) / (dayEnd - dayStart) * 100;
                    const isNext = key === nextKey;
                    return (
                        <div key={key} className={`absolute flex-col items-center gap-0.5 whitespace-nowrap ${i % 2 !== 0 ? 'hidden sm:flex' : 'flex'}`} style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${isNext ? theme.text : theme.textMuted} ${isNext ? '' : 'opacity-50'}`}>{key}</span>
                            <span className={`text-[9px] sm:text-[10px] geo-nums ${isNext ? theme.text : theme.textMuted} ${isNext ? 'opacity-80' : 'opacity-40'}`}>{prayerTimes[key]}</span>
                        </div>
                    );
                })}
            </div>

            {/* The Progress Line */}
            <div className={`relative w-full h-1.5 rounded-full ${theme.divider} overflow-visible`}>
                <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isDark ? 'bg-[#F5F5F5]' : 'bg-[#111827]'}`} style={{ width: `${progress * 100}%` }} />
                {prayers.map((key) => {
                    const pos = (toMins(prayerTimes[key]) - dayStart) / (dayEnd - dayStart) * 100;
                    const isPast = toMins(prayerTimes[key]) <= nowMins;
                    return (
                        <div key={key}
                            className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 ${isPast ? (isDark ? 'bg-[#F5F5F5] border-[#F5F5F5]' : 'bg-[#111827] border-[#111827]') : (isDark ? 'bg-[#0A0A0A] border-[#2A2A2A]' : 'bg-[#F2F3F5] border-[#9CA3AF]')}`}
                            style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }} />
                    );
                })}
                <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg border-2 ${isDark ? 'bg-[#F5F5F5] border-[#0A0A0A]' : 'bg-[#111827] border-white'}`}
                    style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }} />
            </div>

            {/* Bottom Labels (Mobile only - Odd indices) */}
            <div className="relative mt-3 h-8 sm:hidden">
                {prayers.map((key, i) => {
                    if (i % 2 === 0) return null;
                    const pos = (toMins(prayerTimes[key]) - dayStart) / (dayEnd - dayStart) * 100;
                    const isNext = key === nextKey;
                    return (
                        <div key={key} className={`absolute flex flex-col items-center gap-0.5 whitespace-nowrap`} style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
                            <span className={`text-[9px] font-bold uppercase tracking-wider ${isNext ? theme.text : theme.textMuted} ${isNext ? '' : 'opacity-50'}`}>{key}</span>
                            <span className={`text-[9px] geo-nums ${isNext ? theme.text : theme.textMuted} ${isNext ? 'opacity-80' : 'opacity-40'}`}>{prayerTimes[key]}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
