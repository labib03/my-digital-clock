import React from 'react';
import { motion } from 'framer-motion';

interface MetaballProps {
    isDark: boolean;
    colors?: string[];
}

export const FloatingMetaballs: React.FC<MetaballProps> = ({ isDark, colors: propColors }) => {
    // Polychromatic "Aura" Colors
    const defaultColors = isDark
        ? ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981'] // Blue, Purple, Pink, Emerald
        : ['#93C5FD', '#C4B5FD', '#F9A8D4', '#6EE7B7']; // Lighter pastel variants

    const colors = propColors || defaultColors;

    // Kita perbesar keterlihatannya agar warnanya membaur dengan kaya:
    const containerClass = isDark ? 'opacity-[0.35] mix-blend-screen' : 'opacity-[0.45] mix-blend-multiply';

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* SVG Filter untuk mengentalkan blur menjadi cairan (Gooey) */}
            {/* SVG Filter untuk mengentalkan blur menjadi cairan (Gooey) */}
            <svg className="hidden">
                <defs>
                    <filter id="gooey-colorful">
                        {/* Menurunkan stdDeviation dari 40 ke 25 untuk efisiensi */}
                        <feGaussianBlur in="SourceGraphic" stdDeviation="25" result="blur" />
                        <feColorMatrix in="blur" mode="matrix" values="
                            1 0 0 0 0  
                            0 1 0 0 0  
                            0 0 1 0 0  
                            0 0 0 30 -15" result="goo" />
                    </filter>
                </defs>
            </svg>

            {/* Render Cairan Warna Warni */}
            <div className={`absolute inset-0 w-full h-full ${containerClass}`} style={{ filter: "url(#gooey-colorful)" }}>

                {/* Ball 1 - Blue/Cyan */}
                <motion.div
                    className="absolute rounded-full origin-center will-change-transform"
                    style={{ backgroundColor: colors[0], width: '45vw', height: '45vw' }}
                    animate={{
                        x: ['-10vw', '20vw', '-20vw', '5vw', '-10vw'],
                        y: ['0vh', '15vh', '-10vh', '-5vh', '0vh'],
                        scale: [1, 1.2, 0.9, 1.1, 1],
                    }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                />

                {/* Ball 2 - Purple */}
                <motion.div
                    className="absolute rounded-full origin-center will-change-transform"
                    style={{ backgroundColor: colors[1], width: '35vw', height: '35vw', top: '15vh', left: '35vw' }}
                    animate={{
                        x: ['10vw', '-25vw', '5vw', '-15vw', '10vw'],
                        y: ['-5vh', '25vh', '15vh', '-10vh', '-5vh'],
                        scale: [1.1, 0.9, 1.2, 0.9, 1.1],
                    }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />

                {/* Ball 3 - Pink */}
                <motion.div
                    className="absolute rounded-full origin-center will-change-transform"
                    style={{ backgroundColor: colors[2], width: '40vw', height: '40vw', top: '-10vh', right: '-10vw' }}
                    animate={{
                        x: ['-5vw', '-30vw', '15vw', '-15vw', '-5vw'],
                        y: ['10vh', '-15vh', '20vh', '5vh', '10vh'],
                        scale: [0.9, 1.1, 0.8, 1.2, 0.9],
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />

                {/* Ball 4 - Emerald */}
                <motion.div
                    className="absolute rounded-full origin-center will-change-transform flex items-center justify-center mix-blend-color-dodge"
                    style={{ backgroundColor: colors[3], width: '30vw', height: '30vw', top: '35vh', left: '35vw' }}
                    animate={{
                        x: ['0vw', '15vw', '-10vw', '5vw', '0vw'],
                        y: ['0vh', '5vh', '-15vh', '10vh', '0vh'],
                        scale: [1, 1.3, 0.8, 1.2, 1],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </div>
    );
};
