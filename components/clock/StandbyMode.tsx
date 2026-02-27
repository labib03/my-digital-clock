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
    colors?: string[];
}

export const StandbyMode: React.FC<Props> = ({
    setIsStandbyMode, theme, hours, minutes, seconds, animationStyle, is24Hour, ampm, prayerTimes, time, standbyBg
}) => {
    // ─── Dynamic Theme Logic (Ambient Intelligence) ───
    const getDynamicColors = () => {
        if (!prayerTimes) return null;

        const now = time || new Date();
        const currentHour = now.getHours();
        const isDarkTheme = theme.bg === 'bg-[#0A0A0A]';

        // Helper to convert prayer time string to hour number
        const getPrayerHour = (p: keyof PrayerTimes) => parseInt(prayerTimes[p].split(':')[0]);

        const fajr = getPrayerHour('Fajr');
        const sunrise = getPrayerHour('Sunrise');
        const dhuhr = getPrayerHour('Dhuhr');
        const asr = getPrayerHour('Asr');
        const maghrib = getPrayerHour('Maghrib');
        const isha = getPrayerHour('Isha');

        // Theme Palettes
        if (currentHour >= fajr && currentHour < sunrise) {
            // Dawn/Fajr: Deep Purples & Soft Blues
            return isDarkTheme ? ['#2E1065', '#4C1D95', '#1E3A8A', '#312E81'] : ['#C4B5FD', '#DDD6FE', '#BFDBFE', '#A5B4FC'];
        } else if (currentHour >= sunrise && currentHour < dhuhr) {
            // Morning: Morning Gold & Sky Blue
            return isDarkTheme ? ['#B45309', '#78350F', '#0369A1', '#075985'] : ['#FDE68A', '#FEF3C7', '#BAE6FD', '#7DD3FC'];
        } else if (currentHour >= dhuhr && currentHour < asr) {
            // Noon: Bright Cyan & High Noon White/Yellow
            return isDarkTheme ? ['#0891B2', '#155E75', '#CA8A04', '#A16207'] : ['#A5F3FC', '#CFFAFE', '#FEF08A', '#FDE047'];
        } else if (currentHour >= asr && currentHour < maghrib) {
            // Afternoon: Burning Orange & Warm Golds
            return isDarkTheme ? ['#C2410C', '#9A3412', '#B45309', '#78350F'] : ['#FDBA74', '#FFEDD5', '#FCD34D', '#FBBF24'];
        } else if (currentHour >= maghrib && currentHour < isha) {
            // Sunset/Maghrib: Deep Pinks, Oranges & Dark Violets
            return isDarkTheme ? ['#BE185D', '#831843', '#7C3AED', '#4C1D95'] : ['#F9A8D4', '#FBCFE8', '#C4B5FD', '#DDD6FE'];
        } else {
            // Night/Isha: Cosmic Blues & Deep Indigos
            return isDarkTheme ? ['#1E1B4B', '#312E81', '#1E3A8A', '#172554'] : ['#A5B4FC', '#C7D2FE', '#93C5FD', '#BFDBFE'];
        }
    };

    const dynamicColors = getDynamicColors();

    return (
        <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden backdrop-blur-3xl bg-transparent">
            {/* Absolute Background Layer */}
            {standbyBg === 'metaballs' && <FloatingMetaballs isDark={theme.bg === 'bg-[#0A0A0A]'} colors={dynamicColors || undefined} />}
            {standbyBg === 'distortion' && <SubtleDistortion isDark={theme.bg === 'bg-[#0A0A0A]'} seconds={seconds} colorOverride={dynamicColors ? dynamicColors[0] : undefined} />}

            {/* Exit button */}
            <div onClick={() => setIsStandbyMode(false)}
                className={`absolute top-6 right-6 cursor-pointer p-3 rounded-full transition-all duration-300 z-20 ${theme.standbyBtn}`}
                title="Exit Standby">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
            </div>
            <div className="flex flex-col items-center justify-center select-none gap-0">
                <div className={`flex items-center justify-center leading-[0.7] font-medium geo-nums ${theme.text}`}
                    style={{ fontSize: 'min(18vw, 38vh)' }}>
                    {/* Hours */}
                    <AnimatedDigitGroup value={hours} animationStyle={animationStyle} />

                    <div className="pb-[8%] opacity-80 mx-[1vw] leading-none shrink-0">:</div>

                    {/* Minutes */}
                    <AnimatedDigitGroup value={minutes} animationStyle={animationStyle} />

                    <div className="pb-[8%] opacity-80 mx-[1vw] leading-none shrink-0">:</div>

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
                        className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-5 opacity-40 hover:opacity-100 transition-opacity duration-700 select-none">

                        {/* 3 Information Grouped Minimally */}
                        <div className="flex items-center gap-3">
                            <span className={`uppercase font-bold tracking-[0.2em] ${theme.textMuted}`} style={{ fontSize: 'min(1vw, 0.65rem)' }}>
                                {label.en}
                            </span>
                            <span className={`font-black geo-nums ${theme.text}`} style={{ fontSize: 'min(2.8vw, 4vh)', letterSpacing: '-0.02em' }}>
                                {prayerTimes[nextKey]}
                            </span>
                        </div>

                        <div className={`w-[1px] h-4 ${theme.bgMuted} opacity-20`} />

                        <span className={`font-medium geo-nums ${theme.textMuted} opacity-60 tracking-wider`} style={{ fontSize: 'min(2vw, 2.5vh)' }}>
                            {cdHrs > 0 ? `${fmt(cdHrs)}:` : ''}{fmt(cdMins)}:{fmt(cdSecs)}
                        </span>
                    </motion.div>
                );
            })()}
        </div>
    );
};
