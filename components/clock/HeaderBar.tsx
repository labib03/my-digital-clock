import React from 'react';
import Link from 'next/link';

interface Props {
    isDark: boolean;
    setIsDark: (val: boolean) => void;
    setIsStandbyMode: (val: boolean) => void;
    theme: any;
}

export const HeaderBar: React.FC<Props> = ({ isDark, setIsDark, setIsStandbyMode, theme }) => {
    return (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 lg:pt-10">
            {/* Dark/Light Toggle */}
            <div onClick={() => setIsDark(!isDark)}
                className={`cursor-pointer p-2 rounded-full transition-all duration-200 ${isDark ? 'hover:bg-white/10 opacity-70 hover:opacity-100' : 'hover:bg-black/5 opacity-40 hover:opacity-100'}`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                {isDark ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                )}
            </div>
            {/* Logo */}
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                <span className="font-semibold text-lg lg:text-xl tracking-tight">Mawaqit</span>
            </div>
            {/* Right Actions */}
            <div className="flex items-center gap-1">
                {/* Pomodoro Link */}
                <Link href="/pomodoro"
                    className={`cursor-pointer p-3 rounded-full transition-all duration-300 ${theme.standbyBtn}`}
                    title="Pomodoro Timer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </Link>
                {/* Standby button */}
                <div onClick={() => setIsStandbyMode(true)}
                    className={`cursor-pointer p-3 rounded-full transition-all duration-300 ${theme.standbyBtn}`}
                    title="Enter Standby Mode">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
                </div>
            </div>
        </div>
    );
};
