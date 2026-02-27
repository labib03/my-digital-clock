import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    isDark: boolean;
    seconds: string;
}

export const SubtleDistortion: React.FC<Props> = ({ isDark, seconds }) => {
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
                    <filter id="refraction-distortion" x="-20%" y="-20%" width="140%" height="140%">
                        {/* Menghasilkan tekstur acak pergerakan cairan */}
                        <feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="2" result="noise">
                            <animate attributeName="baseFrequency" values="0.008;0.012;0.008" dur="30s" repeatCount="indefinite" />
                        </feTurbulence>
                        {/* Menggeser (distorsi) elemen asli berdasarkan noise di atas */}
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </defs>
            </svg>

            <div className="absolute inset-0 w-full h-full" style={{ filter: 'url(#refraction-distortion)' }}>
                {/* Latar cairan buram yang menetap dan bergerak pelan */}
                <motion.div
                    className="absolute inset-0"
                    style={{
                        background: `radial-gradient(ellipse at 50% 50%, rgba(${color}, 0.06) 0%, rgba(${color}, 0) 50%)`
                    }}
                    animate={{
                        scale: [1, 1.25, 0.9, 1],
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Lapisan Kedalaman (Depth Ripples): 
                    Efek sentakan cahaya di belakang angka yang memberikan ilusi distorsi kaca cair jatuh */}
                <AnimatePresence>
                    {ripples.map(ripple => (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0.6, opacity: 0.15, filter: 'blur(20px)', y: '0vh' }}
                            animate={{ scale: 2.2, opacity: 0, filter: 'blur(50px)', y: '8vh' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3, ease: "easeOut" }}
                            className="absolute rounded-[40%] outline-none border-none pointer-events-none"
                            style={{
                                backgroundColor: `rgba(${color}, 0.8)`,
                                width: '30vw',
                                height: '30vw',
                                top: '50%',
                                left: '50%',
                                marginLeft: '-15vw',
                                marginTop: '-15vw' // Diposisikan pas di tengah jam
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};
