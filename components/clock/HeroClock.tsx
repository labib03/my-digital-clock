import React from 'react';
import { AnimatedDigitGroup } from "../shared/AnimatedDigitGroup";

interface Props {
    hours: string;
    minutes: string;
    seconds: string;
    animationStyle: 'morph' | 'liquid';
    is24Hour: boolean;
    ampm: string;
    theme: any;
}

export const HeroClock: React.FC<Props> = ({ hours, minutes, seconds, animationStyle, is24Hour, ampm, theme }) => {
    return (
        <div className="flex flex-col items-center justify-center select-none gap-0">
            {/* Numerical Clock */}
            <div className={`flex items-center justify-center leading-[0.7] font-medium geo-nums ${theme.text}`}
                style={{ fontSize: 'clamp(5rem, 18vw, 20vw)' }}>
                {/* Hours */}
                <AnimatedDigitGroup value={hours} animationStyle={animationStyle} />

                <div className="pb-[8%] opacity-80 mx-[0.5vw] leading-none shrink-0">:</div>

                {/* Minutes */}
                <AnimatedDigitGroup value={minutes} animationStyle={animationStyle} />

                <div className="pb-[8%] opacity-80 mx-[0.5vw] leading-none shrink-0">:</div>

                {/* Seconds */}
                <AnimatedDigitGroup value={seconds} animationStyle={animationStyle} />
            </div>

            <div className="flex flex-row items-center gap-6 uppercase select-none z-10"
                style={{ fontSize: 'clamp(0.8rem, 4vw, 1.8vw)', lineHeight: '1', letterSpacing: '0.15em', marginTop: 'clamp(-4rem, -4vw, -1rem)' }}>
                <span className={`font-black transition-opacity duration-500 ${!is24Hour && ampm === 'AM' ? 'opacity-100' : 'opacity-20'}`}>AM</span>
                <span className={`font-black transition-opacity duration-500 ${!is24Hour && ampm === 'PM' ? 'opacity-100' : 'opacity-20'}`}>PM</span>
            </div>
        </div>
    );
};
