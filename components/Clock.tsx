"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchPrayerTimes, getNextPrayer, type PrayerTimes, type HijriDate } from "@/lib/prayerService";

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

    if (!time) return null;

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
        <div className={`w-full min-h-screen relative mx-auto flex flex-col transition-colors duration-300 ${theme.bg} ${theme.text}`}>
            <div className={`w-full max-w-[1400px] mx-auto flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-12 relative`}>

                {/* Standby Toggle Button (Absolute) */}
                <div
                    onClick={() => setIsStandbyMode(!isStandbyMode)}
                    className={`absolute top-6 right-6 lg:top-12 lg:right-12 cursor-pointer p-3 rounded-full transition-all duration-300 z-20 ${theme.standbyBtn}`}
                    title="Toggle Standby Mode"
                >
                    {!isStandbyMode ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
                    )}
                </div>

                {/* Top Header */}
                {!isStandbyMode && (
                    <div className="flex justify-between items-center text-sm font-medium tracking-wide transition-opacity duration-300">
                        {/* Dark/Light Mode Toggle */}
                        <div
                            onClick={() => setIsDark(!isDark)}
                            className={`cursor-pointer p-2 rounded-full transition-all duration-200 ${isDark ? 'hover:bg-white/10 opacity-70 hover:opacity-100' : 'hover:bg-black/5 opacity-40 hover:opacity-100'}`}
                            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDark ? (
                                /* Sun icon */
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                            ) : (
                                /* Moon icon */
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="font-semibold text-lg lg:text-xl tracking-tight">Mawaqit</span>
                        </div>

                        <div className="w-10"></div>
                    </div>
                )}

                {/* Main Time Display */}
                <div className="flex-1 flex flex-col justify-center items-center mt-12 mb-8">
                    <div className={`flex items-center justify-center text-[22vw] sm:text-[14rem] md:text-[16rem] lg:text-[18rem] xl:text-[23rem] leading-none font-medium geo-nums select-none ${theme.text}`} style={{ letterSpacing: '-0.04em' }}>
                        <motion.div
                            key={`h-${hours}`}
                            initial={{ y: -5, opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {hours}
                        </motion.div>
                        <div className="pb-[8%] opacity-80 mx-2 lg:mx-6 leading-none tracking-normal">:</div>
                        <motion.div
                            key={`m-${minutes}`}
                            initial={{ y: -5, opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {minutes}
                        </motion.div>
                        <div className="pb-[8%] opacity-80 mx-2 lg:mx-6 leading-none tracking-normal">:</div>
                        <motion.div
                            key={`s-${seconds}`}
                            initial={{ y: -5, opacity: 0.8 }}
                            animate={{ y: 0, opacity: 1 }}
                        >
                            {seconds}
                        </motion.div>

                        {/* AM/PM Indicator for 12H Mode */}
                        {!is24Hour && (
                            <div className="flex flex-col justify-end pb-[2%] ml-4 lg:ml-8 gap-2">
                                <span className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none ${ampm === 'AM' ? 'opacity-100' : 'opacity-20'}`}>AM</span>
                                <span className={`text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none ${ampm === 'PM' ? 'opacity-100' : 'opacity-20'}`}>PM</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Standby: Next Prayer Info + Countdown */}
                {isStandbyMode && prayerTimes && (() => {
                    const nextKey = getNextPrayer(prayerTimes);
                    const prayerLabels: Record<string, { en: string; ar: string }> = {
                        Fajr: { en: 'Fajr', ar: 'الفجر' },
                        Sunrise: { en: 'Sunrise', ar: 'الشروق' },
                        Dhuhr: { en: 'Dhuhr', ar: 'الظهر' },
                        Asr: { en: 'Asr', ar: 'العصر' },
                        Maghrib: { en: 'Maghrib', ar: 'المغرب' },
                        Isha: { en: 'Isha', ar: 'العشاء' },
                    };
                    const label = prayerLabels[nextKey];

                    // Countdown calculation (driven by `time` state — updates every second)
                    const [nh, nm] = prayerTimes[nextKey].split(':').map(Number);
                    const now = time ?? new Date();
                    const totalSecsLeft = ((nh * 60 + nm) - (now.getHours() * 60 + now.getMinutes())) * 60 - now.getSeconds();
                    const secsLeft = totalSecsLeft > 0 ? totalSecsLeft : totalSecsLeft + 86400;
                    const cdHrs = Math.floor(secsLeft / 3600);
                    const cdMins = Math.floor((secsLeft % 3600) / 60);
                    const cdSecs = secsLeft % 60;
                    const fmt = (n: number) => String(n).padStart(2, '0');

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-col items-center gap-2 pb-12"
                        >
                            {/* Label */}
                            <p className={`text-xs font-bold uppercase tracking-[0.25em] ${theme.textMuted} opacity-60`}>
                                Next Prayer
                            </p>

                            {/* Prayer name + scheduled time */}
                            <div className="flex items-baseline gap-4">
                                <span className={`text-2xl lg:text-3xl font-medium ${theme.textMuted}`} style={{ fontFamily: 'serif' }}>
                                    {label.ar}
                                </span>
                                <span className={`text-4xl lg:text-6xl font-semibold tracking-tight geo-nums ${theme.text}`} style={{ letterSpacing: '-0.03em' }}>
                                    {prayerTimes[nextKey]}
                                </span>
                                <span className={`text-lg lg:text-2xl font-medium ${theme.textMuted} opacity-70`}>
                                    {label.en}
                                </span>
                            </div>

                            {/* Live countdown */}
                            <div className="flex flex-col items-center gap-0.5 mt-1">
                                <span className={`text-2xl lg:text-4xl font-semibold geo-nums tracking-tight ${theme.textMuted} opacity-70`} style={{ letterSpacing: '-0.03em' }}>
                                    {cdHrs > 0 ? `${fmt(cdHrs)}:` : ''}{fmt(cdMins)}:{fmt(cdSecs)}
                                </span>
                                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${theme.textMuted} opacity-40`}>
                                    remaining
                                </span>
                            </div>
                        </motion.div>
                    );
                })()}


                {/* Bottom Sections - Hidden in Standby Mode */}
                {!isStandbyMode && (
                    <div className="transition-all duration-300 ease-in-out">
                        {/* Bottom Details Section within the main viewport frame */}
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pt-8 mt-4 text-sm lg:text-[0.95rem]">
                            <div className={`opacity-50 font-medium mb-4 sm:mb-0`}>
                                Current
                            </div>

                            <div className="text-center flex flex-col gap-1 mb-4 sm:mb-0">
                                {/* Option D: Dynamic Sunrise/Sunset from Aladhan + Hijri date inline */}
                                {prayerTimes ? (() => {
                                    // Compute daylight duration from Sunrise → Maghrib
                                    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
                                    const riseMins = toMins(prayerTimes.Sunrise);
                                    const setMins = toMins(prayerTimes.Maghrib);
                                    const diff = setMins - riseMins;
                                    const dh = Math.floor(diff / 60);
                                    const dm = diff % 60;
                                    // Strip seconds from Aladhan time (format: HH:MM or HH:MM (DST))
                                    const cleanTime = (t: string) => t.split(' ')[0];
                                    return (
                                        <div className="font-semibold flex items-center justify-center gap-2">
                                            {/* Sunrise */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 flex-shrink-0">
                                                <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 6l-4-4-4 4M12 6v6" />
                                            </svg>
                                            <span className="geo-nums">{cleanTime(prayerTimes.Sunrise)}</span>
                                            <span className={`${theme.textMuted} opacity-50`}>—</span>
                                            {/* Sunset */}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400 flex-shrink-0">
                                                <path d="M12 10v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 18l-4 4-4-4M12 18V12" />
                                            </svg>
                                            <span className="geo-nums">{cleanTime(prayerTimes.Maghrib)}</span>
                                            <span className={`opacity-50 text-sm ml-1`}>({dh}h {dm}m)</span>
                                        </div>
                                    );
                                })() : (
                                    <div className={`font-semibold ${theme.textMuted} opacity-50`}>—</div>
                                )}

                                {/* Gregorian date */}
                                <div className={`${theme.textMuted} font-medium`}>{fullDateStr}</div>

                                {/* Hijri date inline */}
                                {hijriDate && (
                                    <div className={`text-xs font-semibold ${theme.textMuted} opacity-70`}>
                                        <span style={{ fontFamily: 'serif' }}>{hijriDate.day} {hijriDate.month.ar}</span>
                                        {' '}·{' '}
                                        {hijriDate.month.en} {hijriDate.year} AH
                                    </div>
                                )}
                            </div>


                            <div className={`flex shadow-sm border rounded-full p-1 gap-1 ${theme.toggleBg}`}>
                                <div
                                    onClick={() => setIs24Hour(false)}
                                    className={`px-5 py-2 rounded-full transition cursor-pointer font-semibold ${!is24Hour ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}
                                >
                                    12h
                                </div>
                                <div
                                    onClick={() => setIs24Hour(true)}
                                    className={`px-5 py-2 rounded-full transition cursor-pointer font-semibold ${is24Hour ? `${theme.toggleActive} shadow-md` : theme.toggleInactive}`}
                                >
                                    24h
                                </div>
                            </div>
                        </div>


                        {/* Thin divider before prayer times */}
                        <div className={`w-full h-[1px] my-10 ${theme.divider}`}></div>

                        {/* Prayer Times Section Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6">
                            <div>
                                {locationStatus === 'loading' ? (
                                    <div className={`flex items-center gap-3 ${theme.textMuted}`}>
                                        <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                                        <span className="text-lg font-medium">Detecting location...</span>
                                    </div>
                                ) : locationStatus === 'error' ? (
                                    <div className={`flex items-center gap-2 ${theme.textMuted}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        <span className="text-lg font-medium">Location unavailable</span>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-2"
                                    >
                                        <h2
                                            className={`text-4xl lg:text-5xl font-medium tracking-tight leading-tight ${theme.text}`}
                                            style={{ letterSpacing: '-0.02em' }}
                                        >
                                            <span className="flex items-center gap-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                                {location?.city},
                                            </span>
                                            <span className="ml-11">{location?.country}</span>
                                        </h2>
                                        {location?.district && (
                                            <p className={`ml-11 mt-2 text-base font-medium tracking-wide ${theme.textMuted}`}>
                                                {location.district}
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Option C: Hijri Month Info + Days to Ramadan */}
                            {hijriDate && (
                                <div className={`hidden lg:flex flex-col gap-1 text-sm font-medium ${theme.textMuted}`}>
                                    <span className="text-xs uppercase tracking-widest opacity-50 font-bold">Islamic Calendar</span>
                                    <span className={`text-base font-semibold ${theme.text}`}>
                                        <span style={{ fontFamily: 'serif' }}>{hijriDate.month.ar}</span>
                                        {' '}{hijriDate.year} AH
                                    </span>
                                    {(() => {
                                        // Days to Ramadan: Ramadan = month 9
                                        const currentMonth = hijriDate.month.number;
                                        const currentDay = parseInt(hijriDate.day);
                                        let daysLeft: number | null = null;
                                        if (currentMonth < 9) {
                                            // Approximate: remaining days in current month + days in months until Ramadan
                                            const daysInMonths = [0, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
                                            let days = (daysInMonths[currentMonth] - currentDay);
                                            for (let m = currentMonth + 1; m < 9; m++) days += daysInMonths[m];
                                            daysLeft = days + 1;
                                        } else if (currentMonth === 9) {
                                            daysLeft = null; // It's Ramadan!
                                        }
                                        return daysLeft !== null ? (
                                            <span className="text-xs opacity-70">
                                                ✦ {daysLeft} days to Ramadan
                                            </span>
                                        ) : (
                                            <span className="text-xs text-amber-500 font-bold">🌙 Ramadan Mubarak!</span>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Option A: Countdown to Next Prayer */}
                            {prayerTimes && (() => {
                                const nextKey = getNextPrayer(prayerTimes);
                                const [nh, nm] = prayerTimes[nextKey].split(':').map(Number);
                                const now = new Date();
                                const totalSecsLeft = ((nh * 60 + nm) - (now.getHours() * 60 + now.getMinutes())) * 60 - now.getSeconds();
                                const secsLeft = totalSecsLeft > 0 ? totalSecsLeft : totalSecsLeft + 86400;
                                const hrs = Math.floor(secsLeft / 3600);
                                const mins = Math.floor((secsLeft % 3600) / 60);
                                const secs = secsLeft % 60;
                                const fmt = (n: number) => String(n).padStart(2, '0');
                                const prayerLabel: Record<string, string> = {
                                    Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر',
                                    Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء',
                                };
                                return (
                                    <div className={`hidden md:flex flex-col items-end gap-1 text-right`}>
                                        <span className={`text-xs uppercase tracking-widest opacity-50 font-bold ${theme.textMuted}`}>
                                            Next Prayer
                                        </span>
                                        <div className={`flex items-baseline gap-2 ${theme.text}`}>
                                            <span className="text-base font-semibold" style={{ fontFamily: 'serif' }}>
                                                {prayerLabel[nextKey]}
                                            </span>
                                            <span className="text-sm font-medium opacity-60">{nextKey}</span>
                                        </div>
                                        <span className={`text-2xl font-semibold geo-nums tracking-tight ${theme.text}`} style={{ letterSpacing: '-0.03em' }}>
                                            {hrs > 0 ? `${fmt(hrs)}:` : ''}{fmt(mins)}:{fmt(secs)}
                                        </span>
                                        <span className={`text-xs ${theme.textMuted} opacity-50`}>remaining</span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Option D: Prayer Progress Bar */}
                        {prayerTimes && (() => {
                            const prayers: (keyof typeof prayerTimes)[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
                            const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
                            const now = new Date();
                            const nowMins = now.getHours() * 60 + now.getMinutes();
                            const dayStart = toMins(prayerTimes['Fajr']);
                            const dayEnd = toMins(prayerTimes['Isha']) + 90; // 90min after Isha
                            const progress = Math.max(0, Math.min(1, (nowMins - dayStart) / (dayEnd - dayStart)));
                            const nextKey = getNextPrayer(prayerTimes);
                            return (
                                <div className="mt-6">
                                    {/* Tick labels */}
                                    <div className="relative flex justify-between mb-2">
                                        {prayers.map((key) => {
                                            const pos = (toMins(prayerTimes[key]) - dayStart) / (dayEnd - dayStart) * 100;
                                            const isNext = key === nextKey;
                                            return (
                                                <div
                                                    key={key}
                                                    className="absolute flex flex-col items-center gap-0.5"
                                                    style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
                                                >
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isNext ? theme.text : theme.textMuted} ${isNext ? '' : 'opacity-50'}`}>
                                                        {key}
                                                    </span>
                                                    <span className={`text-[10px] geo-nums ${isNext ? theme.text : theme.textMuted} ${isNext ? 'opacity-80' : 'opacity-40'}`}>
                                                        {prayerTimes[key]}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Bar */}
                                    <div className={`relative w-full h-1.5 rounded-full mt-8 ${theme.divider} overflow-visible`}>
                                        {/* Filled portion */}
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isDark ? 'bg-[#F5F5F5]' : 'bg-[#111827]'}`}
                                            style={{ width: `${progress * 100}%` }}
                                        />
                                        {/* Prayer tick marks */}
                                        {prayers.map((key) => {
                                            const pos = (toMins(prayerTimes[key]) - dayStart) / (dayEnd - dayStart) * 100;
                                            const isPast = toMins(prayerTimes[key]) <= nowMins;
                                            return (
                                                <div
                                                    key={key}
                                                    className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 ${isPast
                                                        ? (isDark ? 'bg-[#F5F5F5] border-[#F5F5F5]' : 'bg-[#111827] border-[#111827]')
                                                        : (isDark ? 'bg-[#0A0A0A] border-[#2A2A2A]' : 'bg-[#F2F3F5] border-[#9CA3AF]')
                                                        }`}
                                                    style={{ left: `${pos}%`, transform: 'translate(-50%, -50%)' }}
                                                />
                                            );
                                        })}
                                        {/* Now indicator */}
                                        <div
                                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg border-2 ${isDark ? 'bg-[#F5F5F5] border-[#0A0A0A]' : 'bg-[#111827] border-white'}`}
                                            style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
                                        />
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Prayer Times Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                            {prayerStatus === 'loading' && (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className={`p-5 rounded-[1.5rem] h-36 border animate-pulse ${theme.cardInactive}`} />
                                ))
                            )}
                            {prayerStatus === 'error' && (
                                <div className={`col-span-full text-center py-6 text-sm ${theme.textMuted}`}>
                                    Prayer times unavailable — location access required
                                </div>
                            )}
                            {prayerStatus === 'idle' && !coords && (
                                <div className={`col-span-full text-center py-6 text-sm ${theme.textMuted}`}>
                                    Allow location access to see prayer times
                                </div>
                            )}
                            {prayerStatus === 'done' && prayerTimes && (() => {
                                const nextPrayer = getNextPrayer(prayerTimes);
                                const prayers: { key: keyof PrayerTimes; labelEN: string; labelAR: string; icon: string }[] = [
                                    { key: 'Fajr', labelEN: 'Fajr', labelAR: 'الفجر', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707' },
                                    { key: 'Dhuhr', labelEN: 'Dhuhr', labelAR: 'الظهر', icon: 'M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z' },
                                    { key: 'Asr', labelEN: 'Asr', labelAR: 'العصر', icon: 'M17 12h-5v5m5-5A5 5 0 1 1 7 12a5 5 0 0 1 10 0z' },
                                    { key: 'Maghrib', labelEN: 'Maghrib', labelAR: 'المغرب', icon: 'M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z' },
                                    { key: 'Isha', labelEN: 'Isha', labelAR: 'العشاء', icon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' },
                                ];
                                return prayers.map(({ key, labelEN, labelAR, icon }, idx) => {
                                    const isNext = key === nextPrayer;
                                    return (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.07 }}
                                            className={`p-5 rounded-[1.5rem] flex flex-col justify-between h-36 border shadow-sm transition cursor-default ${isNext ? theme.cardActive : theme.cardInactive
                                                }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className={`text-xs font-semibold uppercase tracking-widest ${isNext ? 'opacity-70' : 'opacity-50'}`}>{labelEN}</p>
                                                    <p className={`text-xs mt-0.5 ${isNext ? 'opacity-60' : 'opacity-40'}`} style={{ fontFamily: 'serif', direction: 'rtl' }}>{labelAR}</p>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${isNext ? 'opacity-80' : 'opacity-30'}`}>
                                                    <path d={icon} />
                                                </svg>
                                            </div>
                                            <div className="mt-auto">
                                                <p className={`text-3xl font-semibold tracking-tight geo-nums ${isNext ? 'opacity-100' : 'opacity-80'}`}>
                                                    {prayerTimes[key]}
                                                </p>
                                                {isNext && (
                                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Next</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
