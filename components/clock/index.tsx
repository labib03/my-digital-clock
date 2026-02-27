"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPrayerTimes, getNextPrayer, type PrayerTimes, type HijriDate } from "@/lib/prayerService";
import { AnimatedDigitGroup } from "../shared/AnimatedDigitGroup";
import { SettingsModal } from "../settings/SettingsModal";
import { StandbyMode } from "./StandbyMode";
import { PrayerProgressBar } from "../prayer/PrayerProgressBar";
import { PrayerTimesCards } from "../prayer/PrayerTimesCards";
import { HeroClock } from "./HeroClock";
import { HeaderBar } from "./HeaderBar";
import { InfoBar } from "./InfoBar";
import { PrayerHeader } from "../prayer/PrayerHeader";

export const Clock = () => {
    const [time, setTime] = useState<Date | null>(null);
    const [is24Hour, setIs24Hour] = useState<boolean>(true);
    const [isStandbyMode, setIsStandbyMode] = useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(false);
    const [location, setLocation] = useState<{ city: string; country: string; district?: string } | null>(null);
    const [locationStatus, setLocationStatus] = useState<'loading' | 'done' | 'error'>('loading');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
    const [prayerStatus, setPrayerStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const [animationStyle, setAnimationStyle] = useState<'morph' | 'liquid'>('morph');
    const [isClient, setIsClient] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Initial Load from localStorage
    useEffect(() => {
        setIsClient(true);
        const savedFormat = localStorage.getItem('clock-format');
        const savedStyle = localStorage.getItem('clock-animation');

        if (savedFormat !== null) {
            setIs24Hour(savedFormat === '24h');
        }
        if (savedStyle !== null) {
            setAnimationStyle(savedStyle as 'morph' | 'liquid');
        }
    }, []);

    // Persist changes
    useEffect(() => {
        if (!isClient) return;
        localStorage.setItem('clock-format', is24Hour ? '24h' : '12h');
    }, [is24Hour, isClient]);

    useEffect(() => {
        if (!isClient) return;
        localStorage.setItem('clock-animation', animationStyle);
    }, [animationStyle, isClient]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsStandbyMode(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        setTime(new Date());
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Sync body background+text with dark mode
    useEffect(() => {
        document.body.style.background = isDark ? '#0A0A0A' : '#F2F3F5';
        document.body.style.color = isDark ? '#F5F5F5' : '#111827';
        document.body.style.transition = 'background 0.3s, color 0.3s';
    }, [isDark]);

    // Detect user location
    useEffect(() => {
        const fetchByIP = async () => {
            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                if (data.city && data.country_name) {
                    setLocation({ city: data.city, country: data.country_name });
                    setLocationStatus('done');
                } else {
                    setLocationStatus('error');
                }
            } catch {
                setLocationStatus('error');
            }
        };

        if (!navigator.geolocation) {
            fetchByIP();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lng: longitude });
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const addr = data.address;
                    const city = addr.city || addr.town || addr.village || addr.county || addr.state || 'Unknown';
                    const country = addr.country || 'Unknown';
                    // Precise sub-area: suburb → neighbourhood → quarter → district
                    const district = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.district || undefined;
                    setLocation({ city, country, district });
                    setLocationStatus('done');
                } catch {
                    fetchByIP();
                }
            },
            () => fetchByIP(),
            { timeout: 10000, enableHighAccuracy: true }
        );
    }, []);

    // Fetch prayer times once we have coordinates
    useEffect(() => {
        if (!coords) return;
        setPrayerStatus('loading');
        fetchPrayerTimes(coords.lat, coords.lng)
            .then((result) => {
                setPrayerTimes(result.timings);
                setHijriDate(result.hijriDate);
                setPrayerStatus('done');
            })
            .catch(() => setPrayerStatus('error'));
    }, [coords]);

    if (!time || !isClient) return null;

    const formatComponent = (val: number) => val.toString().padStart(2, "0");

    let rawHours = time.getHours();
    const ampm = rawHours >= 12 ? 'PM' : 'AM';
    if (!is24Hour) {
        rawHours = rawHours % 12 || 12;
    }
    const hours = formatComponent(rawHours);
    const minutes = formatComponent(time.getMinutes());
    const seconds = formatComponent(time.getSeconds());

    // Date formatting
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[time.getDay()];
    const monthName = months[time.getMonth()];
    const dateNum = time.getDate();
    const year = time.getFullYear();

    const fullDateStr = `${dayName}, ${monthName} ${dateNum} ${year}`;
    const dayOfWeek = dayName.substring(0, 3);

    const theme = {
        bg: isDark ? 'bg-[#0A0A0A]' : 'bg-[#F2F3F5]',
        text: isDark ? 'text-[#F5F5F5]' : 'text-[#111827]',
        textMuted: isDark ? 'text-[#9CA3AF]' : 'text-gray-500',
        divider: isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300/80',
        cardActive: isDark ? 'bg-[#F5F5F5] text-[#0A0A0A] border-[#F5F5F5]' : 'bg-[#111827] text-white border-[#111827]',
        cardInactive: isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] hover:opacity-80' : 'bg-white/40 border-gray-200 hover:bg-white',
        toggleBg: isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200',
        toggleActive: isDark ? 'bg-[#F5F5F5] text-[#0A0A0A]' : 'bg-[#111827] text-white',
        toggleInactive: isDark ? 'hover:bg-[#2A2A2A] text-[#9CA3AF] opacity-60' : 'hover:bg-gray-100 opacity-60',
        standbyBtn: isStandbyMode
            ? (isDark ? 'opacity-0 hover:opacity-100 text-[#9CA3AF] bg-white/5' : 'opacity-0 hover:opacity-100 text-gray-500 bg-black/10')
            : (isDark ? 'opacity-40 hover:opacity-100 hover:bg-[#2A2A2A]' : 'opacity-40 hover:opacity-100 hover:bg-black/5'),
        addCityText: isDark ? 'text-[#9CA3AF] hover:text-[#F5F5F5]' : 'text-gray-600 hover:text-black',
    };

    return (
        <div className={`w-full flex flex-col transition-colors duration-300 ${theme.bg} ${theme.text}`}
            style={isStandbyMode ? { position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', zIndex: 50 } : {}}
        >
            {/* ─── STANDBY MODE ─── */}
            {isStandbyMode ? (
                <StandbyMode
                    setIsStandbyMode={setIsStandbyMode}
                    theme={theme}
                    hours={hours}
                    minutes={minutes}
                    seconds={seconds}
                    animationStyle={animationStyle}
                    is24Hour={is24Hour}
                    ampm={ampm}
                    prayerTimes={prayerTimes}
                    time={time}
                />
            ) : (
                <>
                    {/* ─── NORMAL MODE SECTION 1: Full-viewport hero clock ─── */}
                    <section className="relative w-full flex flex-col" style={{ height: '100svh' }}>
                        {/* Header overlaid */}
                        <HeaderBar isDark={isDark} setIsDark={setIsDark} setIsStandbyMode={setIsStandbyMode} theme={theme} />

                        <div className="flex-1 flex justify-center items-center">
                            <HeroClock hours={hours} minutes={minutes} seconds={seconds} animationStyle={animationStyle} is24Hour={is24Hour} ampm={ampm} theme={theme} />
                        </div>

                        {/* Info bar: sunrise/sunset · date · toggle — anchored at bottom of hero */}
                        <InfoBar locationStatus={locationStatus} location={location} fullDateStr={fullDateStr} hijriDate={hijriDate} prayerTimes={prayerTimes} setIsSettingsOpen={setIsSettingsOpen} theme={theme} />

                        {/* Scroll hint */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-20 animate-bounce">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                    </section>

                    {/* ─── NORMAL MODE SECTION 2: Scrollable info ─── */}
                    <section className={`w-full transition-colors duration-300 ${theme.bg}`}>
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-10">

                            {/* Divider */}
                            <div className={`w-full h-[1px] mb-10 ${theme.divider}`}></div>


                            {/* Prayer Times Header: Islamic Calendar + Next Prayer Countdown */}
                            <PrayerHeader hijriDate={hijriDate} prayerTimes={prayerTimes} isDark={isDark} theme={theme} time={time} />

                            {/* Prayer Progress Bar */}
                            <PrayerProgressBar prayerTimes={prayerTimes} time={time} isDark={isDark} theme={theme} />

                            {/* Prayer Times Cards */}
                            <PrayerTimesCards prayerStatus={prayerStatus} coords={coords} prayerTimes={prayerTimes} theme={theme} />
                        </div>
                    </section>
                </>
            )
            }
            {/* Conditional Hidden SVG Filter for Gooey Effect */}
            {animationStyle === 'liquid' && (
                <svg className="hidden" aria-hidden="true">
                    <defs>
                        <filter id="gooey">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                        </filter>
                    </defs>
                </svg>
            )}

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                isDark={isDark}
                theme={theme}
                is24Hour={is24Hour}
                setIs24Hour={setIs24Hour}
                animationStyle={animationStyle}
                setAnimationStyle={setAnimationStyle}
            />
        </div>
    );
};
