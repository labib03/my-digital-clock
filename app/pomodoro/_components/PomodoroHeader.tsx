"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

// ─── PomodoroHeader ───────────────────────────────────────────────────────────

interface PomodoroHeaderProps {
    isDark: boolean;
    cardBg: string;
    isFullscreen: boolean;
    onToggleSettings: () => void;
    onToggleTheme: () => void;
    onToggleFullscreen: () => void;
}

export default function PomodoroHeader({
    isDark,
    cardBg,
    isFullscreen,
    onToggleSettings,
    onToggleTheme,
    onToggleFullscreen
}: PomodoroHeaderProps) {
    const [isInstallAvailable, setIsInstallAvailable] = useState(false);

    useEffect(() => {
        const handleAvailable = (e: any) => setIsInstallAvailable(e.detail);
        window.addEventListener("pwa-prompt-available", handleAvailable);

        if (localStorage.getItem("pwa-is-installed") === "true") {
            setIsInstallAvailable(false);
        }

        return () => window.removeEventListener("pwa-prompt-available", handleAvailable);
    }, []);

    const triggerInstall = () => {
        window.dispatchEvent(new CustomEvent("trigger-pwa-install"));
    };

    return (
        <header
            className="flex-shrink-0 z-20 flex items-center justify-between px-6 sm:px-10 py-4 border-b backdrop-blur-sm"
            style={{
                borderColor: isDark ? "#2A2A2A" : "#E5E7EB",
                backgroundColor: isDark ? "rgba(10,10,10,0.9)" : "rgba(242,243,245,0.9)",
            }}>

            <Link href="/" className="flex items-center gap-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Clock
            </Link>

            <span className="text-sm font-bold tracking-tight opacity-60">Pomodoro</span>

            <div className="flex items-center gap-2">
                {/* Install App Shortcut */}
                {isInstallAvailable && (
                    <button onClick={triggerInstall}
                        className={`p-2 rounded-full border ${cardBg} cursor-pointer opacity-60 hover:opacity-100 transition-all`}
                        title="Install Application">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    </button>
                )}

                {/* Fullscreen toggle */}
                <button onClick={onToggleFullscreen}
                    className={`p-2 rounded-full border ${cardBg} cursor-pointer opacity-60 hover:opacity-100 transition-all`}
                    aria-label="Toggle Fullscreen">
                    {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6" />
                        </svg>
                    )}
                </button>

                {/* Settings toggle */}
                <button onClick={onToggleSettings}
                    className={`p-2 rounded-full border ${cardBg} cursor-pointer opacity-60 hover:opacity-100 transition-all`}
                    aria-label="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>

                {/* Theme toggle */}
                <button onClick={onToggleTheme}
                    className={`p-2 rounded-full border ${cardBg} cursor-pointer opacity-60 hover:opacity-100 transition-all`}
                    aria-label="Toggle theme">
                    {isDark
                        ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    }
                </button>
            </div>
        </header>
    );
}
