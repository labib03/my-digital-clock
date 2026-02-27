import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isDark: boolean;
    seconds: string;
    colorOverride?: string;
}

export const SubtleDistortion: React.FC<Props> = ({ isDark, seconds, colorOverride }) => {
    const [ripples, setRipples] = useState<{ id: string }[]>([]);

    useEffect(() => {
        // Memicu riak distorsi tepat saat angka detik berganti / "meleleh"
        const id = `${Date.now()}-${Math.random()}`;
        setRipples((prev) => [...prev.slice(-1), { id }]); // Simpan max 2 ripple untuk performa
    }, [seconds]);

    const color = isDark ? '255, 255, 255' : '0, 0, 0';

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <svg className="hidden">
                <defs>
                    {/* SVG Refraction & Distortion Filter */}
                    <filter id="refraction-distortion" x="-10%" y="-10%" width="120%" height="120%">
                        {/* numOctaves diturunkan ke 1 untuk performa maksimal */}
                        <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" result="noise" />
                        {/* Scale diturunkan dari 50 ke 20 agar beban hitung piksel lebih ringan */}
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            <div className="absolute inset-0 w-full h-full" style={{ filter: 'url(#refraction-distortion)' }}>
                {/* Latar cairan buram yang menetap dan bergerak pelan */}
                <motion.div
                    className="absolute inset-0 will-change-transform"
                    style={{
                        background: colorOverride
                            ? `radial-gradient(ellipse at 50% 50%, ${colorOverride}22 0%, ${colorOverride}00 50%)`
                            : `radial-gradient(ellipse at 50% 50%, rgba(${color}, 0.06) 0%, rgba(${color}, 0) 50%)`
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.6, 0.8, 0.6],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Lapisan Kedalaman (Depth Ripples) */}
                <AnimatePresence>
                    {ripples.map(ripple => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0.6, opacity: 0.1, y: '0vh' }}
                            animate={{ scale: 2, opacity: 0, y: '5vh' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="absolute rounded-[40%] outline-none border-none pointer-events-none will-change-transform"
                            style={{
                                backgroundColor: `rgba(${color}, 0.5)`,
                                width: '30vw',
                                height: '30vw',
                                top: '50%',
                                left: '50%',
                                marginLeft: '-15vw',
                                marginTop: '-15vw',
                                filter: 'blur(30px)' // Blur diturunkan
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
