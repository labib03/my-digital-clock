import React from 'react';
import { motion } from 'framer-motion';
import { PrayerTimes, getNextPrayer } from '@/lib/prayerService';
import { AnimatedDigitGroup } from "../shared/AnimatedDigitGroup";
import { FloatingMetaballs } from "../shared/FloatingMetaballs";
import { SubtleDistortion } from "../shared/SubtleDistortion";

interface Props {
    setIsStandbyMode: (val: boolean) => void;
    theme: any;
    hours: string;
    minutes: string;
    seconds: string;
    animationStyle: 'morph' | 'liquid';
    is24Hour: boolean;
    ampm: string;
    prayerTimes: PrayerTimes | null;
    time: Date;
    standbyBg: 'metaballs' | 'distortion' | 'none';
}

export const StandbyMode: React.FC<Props> = ({
    setIsStandbyMode, theme, hours, minutes, seconds, animationStyle, is24Hour, ampm, prayerTimes, time, standbyBg
}) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden backdrop-blur-3xl bg-transparent">
            {/* Absolute Background Layer */}
            {standbyBg === 'metaballs' && <FloatingMetaballs isDark={theme.bg === 'bg-[#0A0A0A]'} />}
            {standbyBg === 'distortion' && <SubtleDistortion isDark={theme.bg === 'bg-[#0A0A0A]'} seconds={seconds} />}

            {/* Exit button */}
            <div onClick={() => setIsStandbyMode(false)}
                className={`absolute top-6 right-6 cursor-pointer p-3 rounded-full transition-all duration-300 z-20 ${theme.standbyBtn}`}
                title="Exit Standby">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
            </div>
            <div className="flex flex-col items-center justify-center select-none gap-0">
                <div className={`flex items-center justify-center leading-[0.7] font-medium geo-nums ${theme.text}`}
                    style={{ fontSize: 'min(22vw, 42vh)' }}>
                    {/* Hours */}
                    <AnimatedDigitGroup value={hours} animationStyle={animationStyle} />

                    <div className="pb-[8%] opacity-80 mx-[0.5vw] leading-none shrink-0">:</div>

                    {/* Minutes */}
                    <AnimatedDigitGroup value={minutes} animationStyle={animationStyle} />

                    <div className="pb-[8%] opacity-80 mx-[0.5vw] leading-none shrink-0">:</div>

                    {/* Seconds */}
                    <AnimatedDigitGroup value={seconds} animationStyle={animationStyle} />
                </div>

                {/* AM/PM Row */}
                {!is24Hour && (
                    <div className="flex flex-row items-center gap-6 uppercase select-none z-10"
                        style={{ fontSize: 'min(2vw, 3.5vh)', lineHeight: '1', letterSpacing: '0.1em', marginTop: 'min(-3vw, -5vh)' }}>
                        <span className={`font-black ${ampm === 'AM' ? 'opacity-100' : 'opacity-10'}`}>AM</span>
                        <span className={`font-black ${ampm === 'PM' ? 'opacity-100' : 'opacity-10'}`}>PM</span>
                    </div>
                )}
            </div>
            {/* Next Prayer + Countdown */}
            {prayerTimes && (() => {
                const nextKey = getNextPrayer(prayerTimes);
                const prayerLabels: Record<string, { en: string; ar: string }> = {
                    Fajr: { en: 'Fajr', ar: 'الفجر' }, Sunrise: { en: 'Sunrise', ar: 'الشروق' },
                    Dhuhr: { en: 'Dhuhr', ar: 'الظهر' }, Asr: { en: 'Asr', ar: 'العصر' },
                    Maghrib: { en: 'Maghrib', ar: 'المغرب' }, Isha: { en: 'Isha', ar: 'العشاء' },
                };
                const label = prayerLabels[nextKey];
                const [nh, nm] = prayerTimes[nextKey].split(':').map(Number);
                const now = time ?? new Date();
                const totalSecsLeft = ((nh * 60 + nm) - (now.getHours() * 60 + now.getMinutes())) * 60 - now.getSeconds();
                const secsLeft = totalSecsLeft > 0 ? totalSecsLeft : totalSecsLeft + 86400;
                const cdHrs = Math.floor(secsLeft / 3600), cdMins = Math.floor((secsLeft % 3600) / 60), cdSecs = secsLeft % 60;
                const fmt = (n: number) => String(n).padStart(2, '0');
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col items-center gap-2 pt-20">
                        <p className={`font-bold uppercase tracking-[0.25em] ${theme.textMuted} opacity-60`} style={{ fontSize: 'min(1.2vw, 0.8rem)' }}>Next Prayer</p>
                        <div className="flex items-baseline gap-4">
                            <span className={`font-medium ${theme.textMuted}`} style={{ fontFamily: 'serif', fontSize: 'min(2.5vw, 2.8vh)' }}>{label.ar}</span>
                            <span className={`font-semibold tracking-tight geo-nums ${theme.text}`} style={{ letterSpacing: '-0.03em', fontSize: 'min(5vw, 7vh)' }}>{prayerTimes[nextKey]}</span>
                            <span className={`font-medium ${theme.textMuted} opacity-70`} style={{ fontSize: 'min(2.5vw, 2.8vh)' }}>{label.en}</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                            <span className={`font-semibold geo-nums tracking-tight ${theme.textMuted} opacity-70`} style={{ letterSpacing: '-0.03em', fontSize: 'min(3.5vw, 5vh)' }}>
                                {cdHrs > 0 ? `${fmt(cdHrs)}:` : ''}{fmt(cdMins)}:{fmt(cdSecs)}
                            </span>
                            <span className={`uppercase font-bold ${theme.textMuted} opacity-40`} style={{ fontSize: 'min(0.9vw, 0.65rem)', letterSpacing: '0.2em' }}>remaining</span>
                        </div>
                    </motion.div>
                );
            })()}
        </div>
    );
};
