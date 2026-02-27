"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const Clock = () => {
    const [time, setTime] = useState<Date | null>(null);
    const [is24Hour, setIs24Hour] = useState<boolean>(true);
    const [isStandbyMode, setIsStandbyMode] = useState<boolean>(false);

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



    return (
        <div className="w-full max-w-[1400px] min-h-screen relative mx-auto my-auto text-[#111827] flex flex-col">
            <div className="w-full flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-12 relative">

                {/* Standby Toggle Button (Absolute) */}
                <div
                    onClick={() => setIsStandbyMode(!isStandbyMode)}
                    className={`absolute top-6 right-6 lg:top-12 lg:right-12 cursor-pointer p-3 rounded-full transition-all duration-300 z-20 ${isStandbyMode ? 'opacity-0 hover:opacity-100 text-gray-500 bg-black/10' : 'opacity-40 hover:opacity-100 hover:bg-black/5 text-[#111827]'}`}
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
                        {/* Invisible div to balance the center alignment */}
                        <div className="w-10"></div>

                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111827]">
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
                    <div className="flex items-center justify-center text-[22vw] sm:text-[14rem] md:text-[16rem] lg:text-[18rem] xl:text-[23rem] leading-none font-medium text-[#111827] geo-nums select-none" style={{ letterSpacing: '-0.04em' }}>
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

                {/* Bottom Sections - Hidden in Standby Mode */}
                {!isStandbyMode && (
                    <div className="transition-all duration-300 ease-in-out">
                        {/* Bottom Details Section within the main viewport frame */}
                        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end pt-8 mt-4 text-sm lg:text-[0.95rem]">
                            <div className="opacity-50 font-medium mb-4 sm:mb-0">
                                Current
                            </div>

                            <div className="text-center flex flex-col gap-1 mb-4 sm:mb-0">
                                <div className="font-semibold flex items-center justify-center gap-2">
                                    {dayOfWeek} <span className="text-orange-500">☀️</span> : 06:15 - 18:20 <span className="opacity-60 text-sm ml-1">(12h 05m)</span>
                                </div>
                                <div className="opacity-60 font-medium">{fullDateStr}</div>
                            </div>

                            <div className="flex bg-white shadow-sm border border-gray-200 rounded-full p-1 gap-1">
                                <div
                                    onClick={() => setIs24Hour(false)}
                                    className={`px-5 py-2 rounded-full transition cursor-pointer font-semibold ${!is24Hour ? 'bg-[#111827] text-white shadow-md' : 'hover:bg-gray-100 opacity-60'}`}
                                >
                                    12h
                                </div>
                                <div
                                    onClick={() => setIs24Hour(true)}
                                    className={`px-5 py-2 rounded-full transition cursor-pointer font-semibold ${is24Hour ? 'bg-[#111827] text-white shadow-md' : 'hover:bg-gray-100 opacity-60'}`}
                                >
                                    24h
                                </div>
                            </div>
                        </div>

                        {/* Thin divider before cities */}
                        <div className="w-full h-[1px] bg-gray-300/80 my-10"></div>

                        {/* Bottom Cities Section Mockup */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-[#111827] leading-tight mb-2" style={{ letterSpacing: '-0.02em' }}>
                                    London,<br />United Kingdom
                                </h2>
                            </div>

                            <div className="hidden lg:block text-sm font-medium text-gray-500 max-w-xs leading-relaxed">
                                Life moves fast. Stay on time<br />and enjoy every moment!
                            </div>

                            <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black transition cursor-pointer mt-4 lg:mt-0">
                                Add Another City
                                <svg className="opacity-60" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                            {[
                                { city: 'Los Angeles', offset: 'UTC-8', time: '00:15', status: 'Night', icon: '🌙', active: false },
                                { city: 'New York', offset: 'UTC-4', time: '03:15', status: 'Night', icon: '🌙', active: false },
                                { city: 'London', offset: 'UTC+0', time: '08:15', status: 'Day', icon: '☀️', active: true },
                                { city: 'Paris', offset: 'UTC+1', time: '09:15', status: 'Day', icon: '☀️', active: false },
                            ].map((item, idx) => (
                                <div key={idx} className={`p-6 rounded-[1.5rem] flex flex-col justify-between h-36 border ${item.active ? 'bg-[#111827] text-white shadow-xl border-[#111827]' : 'bg-white/40 border-gray-200 hover:bg-white transition shadow-sm'}`}>
                                    <div className="flex justify-between items-center text-sm font-medium opacity-60">
                                        <span>{item.city}</span>
                                        <span className="text-xs">{item.offset}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mt-auto">
                                        <span className={`text-4xl font-medium tracking-tight ${item.active ? 'opacity-100' : 'opacity-90'}`}>{item.time}</span>
                                        <span className="text-sm font-semibold flex items-center gap-1 opacity-70">
                                            <span style={{ fontSize: '0.8rem' }} className={item.icon === '☀️' ? 'text-yellow-500' : 'text-blue-300'}>{item.icon}</span> {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
