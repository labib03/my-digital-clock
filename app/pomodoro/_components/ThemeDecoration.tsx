"use client";

export default function ThemeDecoration({ isDark }: { isDark: boolean }) {
    return (
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className={`absolute inset-0 transition-colors duration-700 ${isDark ? 'bg-[#15151A]' : 'bg-[#F1F5F9]'}`} />

            {/* Dot Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(${isDark ? '#FFF' : '#000'} 2px, transparent 2px)`,
                    backgroundSize: '30px 30px'
                }}
            />
        </div>
    );
}