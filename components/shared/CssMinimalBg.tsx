import React from 'react';

interface Props {
    isDark: boolean;
    colors?: string[];
}

/**
 * CssMinimalBg - 'Bold Aurora' Edition
 * High-performance, CSS-only background with thick, moving gradients.
 * Grid removed and color intensity increased for better visibility.
 */
export const CssMinimalBg: React.FC<Props> = ({ isDark, colors }) => {
    const defaultColors = isDark
        ? ['#1E1B4B', '#312E81', '#4C1D95', '#1E3A8A']
        : ['#E0F2FE', '#F0F9FF', '#C7D2FE', '#E0E7FF'];

    const activeColors = colors || defaultColors;

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-transparent">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes aurora-1 {
                    0% { transform: translate(-15%, -15%) rotate(0deg) scale(1.3); }
                    50% { transform: translate(15%, 10%) rotate(180deg) scale(1.1); }
                    100% { transform: translate(-15%, -15%) rotate(360deg) scale(1.3); }
                }
                @keyframes aurora-2 {
                    0% { transform: translate(15%, 25%) rotate(0deg) scale(1.1); }
                    50% { transform: translate(-15%, -15%) rotate(-180deg) scale(1.4); }
                    100% { transform: translate(15%, 25%) rotate(-360deg) scale(1.1); }
                }
                @keyframes aurora-3 {
                    0% { transform: translate(-5%, 35%) scale(1.2); }
                    50% { transform: translate(25%, -15%) scale(1); }
                    100% { transform: translate(-5%, 35%) scale(1.2); }
                }
                @keyframes pulse-opacity {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 0.9; }
                }
                
                .aurora-container {
                    position: absolute;
                    inset: -50%;
                    filter: blur(60px); /* Slightly lower blur for 'thicker' appearance */
                    opacity: ${isDark ? 0.6 : 0.8}; /* Increased opacity */
                    animation: pulse-opacity 12s infinite ease-in-out;
                }
                
                .aurora-blob {
                    position: absolute;
                    border-radius: 50%;
                    width: 100vmax;
                    height: 100vmax;
                    mix-blend-mode: ${isDark ? 'screen' : 'multiply'};
                    will-change: transform;
                }
                
                .blob-1 {
                    top: -10%;
                    left: -20%;
                    background: radial-gradient(circle, ${activeColors[0]} 0%, transparent 85%);
                    animation: aurora-1 30s infinite linear;
                }
                
                .blob-2 {
                    bottom: -20%;
                    right: -10%;
                    background: radial-gradient(circle, ${activeColors[1] || activeColors[0]} 0%, transparent 85%);
                    animation: aurora-2 35s infinite linear;
                }
                
                .blob-3 {
                    top: 25%;
                    left: 25%;
                    background: radial-gradient(circle, ${activeColors[2] || activeColors[1]} 0%, transparent 75%);
                    animation: aurora-3 25s infinite ease-in-out;
                    opacity: 0.7;
                }
            ` }} />

            <div className="aurora-container">
                <div className="aurora-blob blob-1" />
                <div className="aurora-blob blob-2" />
                <div className="aurora-blob blob-3" />
            </div>

            {/* Subtle Grainy Texture Layer */}
            <div className={`absolute inset-0 opacity-[0.06] ${isDark ? 'invert' : ''}`}
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay'
                }}
            />
        </div>
    );
};
