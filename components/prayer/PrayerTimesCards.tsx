import React from 'react';
import { motion } from 'framer-motion';
import { PrayerTimes, getNextPrayer } from '@/lib/prayerService';
import { useLanguage } from '../shared/LanguageContext';

interface Props {
    prayerStatus: 'idle' | 'loading' | 'done' | 'error';
    coords: { lat: number; lng: number } | null;
    prayerTimes: PrayerTimes | null;
    theme: any;
}

export const PrayerTimesCards: React.FC<Props> = ({ prayerStatus, coords, prayerTimes, theme }) => {
    const { t } = useLanguage();
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
            {prayerStatus === 'loading' && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`p-5 rounded-[1.5rem] h-36 border animate-pulse ${theme.cardInactive}`} />
            ))}
            {prayerStatus === 'error' && (
                <div className={`col-span-full text-center py-6 text-sm ${theme.textMuted}`}>Prayer times unavailable — location access required</div>
            )}
            {prayerStatus === 'idle' && !coords && (
                <div className={`col-span-full text-center py-6 text-sm ${theme.textMuted}`}>Allow location access to see prayer times</div>
            )}
            {prayerStatus === 'done' && prayerTimes && (() => {
                const nextPrayer = getNextPrayer(prayerTimes);
                const prayers: { key: keyof PrayerTimes; label: string; icon: string }[] = [
                    { key: 'Fajr', label: t('fajr'), icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707' },
                    { key: 'Dhuhr', label: t('dhuhr'), icon: 'M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z' },
                    { key: 'Asr', label: t('asr'), icon: 'M17 12h-5v5m5-5A5 5 0 1 1 7 12a5 5 0 0 1 10 0z' },
                    { key: 'Maghrib', label: t('maghrib'), icon: 'M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z' },
                    { key: 'Isha', label: t('isha'), icon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
                ];
                return prayers.map(({ key, label, icon }, idx) => {
                    const isNext = key === nextPrayer;
                    return (
                        <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                            className={`p-5 rounded-[1.5rem] flex flex-col justify-between h-36 border shadow-sm transition cursor-default ${isNext ? theme.cardActive : theme.cardInactive}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-widest ${isNext ? 'opacity-70' : 'opacity-50'}`}>{label}</p>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${isNext ? 'opacity-80' : 'opacity-30'}`}><path d={icon} /></svg>
                            </div>
                            <div className="mt-auto">
                                <p className={`text-3xl font-semibold tracking-tight geo-nums ${isNext ? 'opacity-100' : 'opacity-80'}`}>{prayerTimes[key]}</p>
                                {isNext && <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">{t('next')}</p>}
                            </div>
                        </motion.div>
                    );
                });
            })()}
        </div>
    );
};
